import { fabric } from "fabric";
import { Network } from "@mehra/ts";

import instantiateTools, { Tool, Tools } from "./tools";
import Page from "./page";
import Pages from "./pages";
import FileHandler, { JSONReader } from "./files";
import HistoryHandler from "./history";
import ClipboardHandler from "./clipboard";
import StyleHandler, { Dash, Fill, Stroke, Style } from "./styles";
import ActionHandler from "./action";
import KeyboardHandler, { KeyMap } from "./keyboard";
import { HTMLChildElement } from "../types/html";
import {
  FabricIEvent,
  GuaranteedIObjectOptions,
  ObjectId,
  PathEvent,
} from "../types/fabric";

type Async<T = void> = T | Promise<T>;

type FabricHandler<T extends fabric.IEvent = fabric.IEvent> = (e: T) => Async;
import AssertType from "../types/assert";

export interface QBoardState {
  dragActive: boolean;
  currentPage: number;
  totalPages: number;
  currentStyle: Style;
  canUndo: boolean;
  canRedo: boolean;
  keyMap: KeyMap;
}

export default class QBoard {
  baseCanvas: Page;
  canvas: Page;
  pages: Pages;
  files: FileHandler;
  history: HistoryHandler;
  clipboard: ClipboardHandler;
  style: StyleHandler;
  action: ActionHandler;
  keyboard: KeyboardHandler;

  tools: Tools;
  activeTool: Tool;
  currentStyle: Style = {
    dash: Dash.Solid,
    stroke: Stroke.Black,
    fill: Fill.Transparent,
  };
  readonly drawerOptions: GuaranteedIObjectOptions = {
    fill: "transparent",
    stroke: "#000000",
    strokeWidth: 4,
    selectable: false,
    strokeDashArray: [0, 0],
    strokeUniform: true,
  };

  resizeCooldown: NodeJS.Timeout | undefined;
  currentObject: fabric.Object | undefined;
  dragActive = false;
  isDown = false;
  strict = false;
  callback: ((state: QBoardState) => void) | undefined;

  constructor(
    public canvasElement: HTMLCanvasElement & HTMLChildElement,
    public baseCanvasElement: HTMLCanvasElement & HTMLChildElement,
    public canvasWidth: number,
    public canvasHeight: number
  ) {
    const queryParams = new URLSearchParams(window.location.search);

    this.baseCanvas = new Page(baseCanvasElement, {
      backgroundColor: "white",
      renderOnAddRemove: false,
      selection: false,
      targetFindTolerance: 15,
    });
    this.canvas = new Page(canvasElement, {
      renderOnAddRemove: false,
      selection: false,
    });
    this.pages = new Pages(
      this.baseCanvas,
      this.canvasWidth,
      this.canvasHeight,
      this.updateState
    );

    {
      const jsonLink = queryParams.get("json");
      if (jsonLink !== null)
        Network.loadJSON(jsonLink)
          .then(JSONReader.readParsed)
          .then(this.pages.overwritePages)
          .catch(console.error);
    }

    this.files = new FileHandler(this.pages);
    this.history = new HistoryHandler(
      this.baseCanvas,
      this.pages,
      this.updateState
    );
    this.clipboard = new ClipboardHandler(
      this.baseCanvas,
      this.pages,
      this.files,
      this.history,
      this.canvasWidth,
      this.canvasHeight
    );
    this.style = new StyleHandler(
      this.currentStyle,
      this.drawerOptions,
      this.baseCanvas.freeDrawingBrush as fabric.BaseBrush,
      this.updateState
    );
    this.tools = instantiateTools(
      this.baseCanvas,
      this.history,
      this.clipboard
    );
    this.action = new ActionHandler(
      this.switchTool,
      this.tools,
      this.currentStyle,
      this.pages,
      this.files,
      this.history,
      this.clipboard,
      this.style.set
    );
    this.keyboard = new KeyboardHandler(
      this.action.doAction,
      (strict: boolean) => (this.strict = strict),
      this.updateState
    );

    // an instance which has no effect (deactivate method is trivial)
    this.activeTool = new Tool(this.baseCanvas, this.history, this.clipboard);
    void this.switchTool();

    void this.windowResize();

    window.onresize = this.windowResize;
    window.onbeforeunload = () => this.baseCanvas.modified || null;
    {
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      this.canvas.on("mouse:down", this.mouseDown);
      this.canvas.on("mouse:move", this.mouseMove);
      this.canvas.on("mouse:up", this.mouseUp);

      this.baseCanvas.on("dragenter", () => this.setDragActive(true));
      this.baseCanvas.on("dragleave", () => this.setDragActive(false));
      this.baseCanvas.on("drop", this.drop);

      // @ts-ignore
      this.baseCanvas.on("path:created", this.pathCreated);
      // @ts-ignore
      this.baseCanvas.on("selection:created", this.selectionCreated);
      // @ts-ignore
      this.baseCanvas.on("object:modified", this.objectModified);
      this.baseCanvas.on("mouse:move", this.updateCursor);
      /* eslint-enable @typescript-eslint/ban-ts-comment */
    }
  }

  updateState = (): void => {
    this?.callback?.({
      dragActive: this.dragActive,
      currentPage: this.pages.currentIndex + 1,
      totalPages: this.pages.pagesJSON.length,
      currentStyle: this.currentStyle,
      canUndo: this.history.history.length > 0,
      canRedo: this.history.redoStack.length > 0,
      keyMap: this.keyboard.keyMap,
    });
  };

  /**
   * Assumes no two instances are the same tool
   */
  switchTool = async (tool: Tool = this.tools.Move): Promise<void> => {
    // Reference equality because of assumption
    if (tool === this.activeTool || !(await tool.activate())) return;

    this.activeTool.deactivate();

    if (tool.isBrush() || tool.requiresBase()) {
      this.baseCanvas.activateSelection();
      this.canvasElement.parentElement.style.display = "none";
    } else {
      this.baseCanvas.deactivateSelection();
      this.canvasElement.parentElement.style.display = "block";
    }

    if (tool.isBrush()) {
      await tool.setBrush(
        this.baseCanvas.freeDrawingBrush as fabric.BaseBrush,
        this.drawerOptions
      );
    }

    this.activeTool = tool;

    this.baseCanvas.isDrawingMode = this.activeTool.isBrush();

    this.updateState();
  };

  windowResize = (): void => {
    if (this.resizeCooldown !== undefined) clearTimeout(this.resizeCooldown);
    this.resizeCooldown = setTimeout(() => {
      this.canvas.fitToWindow(this.canvasWidth, this.canvasHeight);
      this.baseCanvas.fitToWindow(this.canvasWidth, this.canvasHeight);
    }, 100);
  };

  mouseDown: FabricHandler = async (e) => {
    if (!this.activeTool.isDrawing()) return;

    const { x, y } = this.canvas.getPointer(e.e);
    this.isDown = true;
    this.currentObject = await this.activeTool.draw(x, y, this.drawerOptions);
    (this.currentObject as ObjectId).id = this.baseCanvas.getNextId();
    this.canvas.add(this.currentObject);
    this.canvas.requestRenderAll();
  };

  mouseMove: FabricHandler = async (e) => {
    if (!(this.activeTool.isDrawing() && this.isDown)) return;

    const { x, y } = this.canvas.getPointer(e.e);

    if (this.currentObject !== undefined)
      await this.activeTool.resize?.(this.currentObject, x, y, this.strict);

    this.canvas.requestRenderAll();
  };

  mouseUp: FabricHandler = () => {
    if (!this.activeTool.isDrawing()) return;

    this.isDown = false;
    this.baseCanvas.add(fabric.util.object.clone(this.currentObject));
    this.baseCanvas.requestRenderAll();

    AssertType<fabric.Object>(this.currentObject); // can do this because mouseDown sets this

    this.canvas.remove(this.currentObject);
    this.canvas.requestRenderAll();
    this.history.add([this.currentObject]);
  };

  setDragActive = (state: boolean): void => {
    this.dragActive = state;
    this.updateState();
  };

  drop: FabricHandler = async (iEvent) => {
    iEvent.e.stopPropagation();
    iEvent.e.preventDefault();
    await this.updateCursor(iEvent);
    this.setDragActive(false);

    const historyCommand = await this.files.processFiles(
      (iEvent.e as DragEvent).dataTransfer!.files
    );
    this.history.execute(historyCommand);
  };

  pathCreated: FabricHandler<PathEvent> = (e) => {
    if (this.activeTool.isBrush()) this.activeTool.pathCreated(e);
  };

  selectionCreated: FabricHandler<FabricIEvent> = (e) => {
    if (this.history.locked) return;
    return this.history.store(e.selected);
  };

  objectModified: FabricHandler<FabricIEvent> = (e) => {
    this.history.modify(e.target._objects || [e.target]);
    this.history.store(e.target._objects || [e.target]);
  };

  updateCursor: FabricHandler = (iEvent) => {
    const { x, y } = this.baseCanvas.getPointer(iEvent.e);
    this.baseCanvas.cursor = { x, y };
  };
}
