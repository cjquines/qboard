import { fabric } from "fabric";
import { Network } from "@mehra/ts";

import ToolHandler, { Handlers, Tool } from "./tools";
import Page, { ObjectId } from "./page";
import Pages from "./pages";
import FileHandler, { JSONReader } from "./files";
import HistoryHandler from "./history";
import ClipboardHandler from "./clipboard";
import StyleHandler, { Dash, Fill, Stroke, Style } from "./styles";
import ActionHandler from "./action";
import KeyboardHandler, { KeyMap } from "./keyboard";
import { FabricIEvent, PathEvent } from "./fabric";

type Async<T = void> = T | Promise<T>;

type FabricHandler = (e: FabricIEvent) => Async;

export interface QBoardState {
  dragActive: boolean;
  currentPage: number;
  totalPages: number;
  currentTool: Tool;
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

  handlers: ToolHandler[] = Handlers;
  currentStyle: Style = {
    dash: Dash.Solid,
    stroke: Stroke.Black,
    fill: Fill.Transparent,
  };
  drawerOptions: fabric.IObjectOptions = {
    fill: "transparent",
    stroke: "#000000",
    strokeWidth: 4,
    selectable: false,
    strokeDashArray: [0, 0],
    strokeUniform: true,
  };

  resizeCooldown: NodeJS.Timeout;
  currentTool: Tool;
  tool: ToolHandler;
  currentObject: fabric.Object;
  dragActive = false;
  isDown = false;
  strict = false;
  callback: (state: QBoardState) => void;

  constructor(
    public canvasElement: HTMLCanvasElement,
    public baseCanvasElement: HTMLCanvasElement,
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

    if (queryParams.get("json") !== null)
      Network.loadJSON(queryParams.get("json"))
        .then(JSONReader.readParsed)
        .then(this.pages.overwritePages)
        .catch(console.error);

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
    this.action = new ActionHandler(
      this.switchTool,
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

    void this.switchTool(Tool.Move);
    void this.windowResize();

    window.onresize = this.windowResize;
    window.onbeforeunload = () => this.baseCanvas.modified || null;

    this.canvas.on("mouse:down", this.mouseDown);
    this.canvas.on("mouse:move", this.mouseMove);
    this.canvas.on("mouse:up", this.mouseUp);

    this.baseCanvas.on("dragenter", () => this.setDragActive(true));
    this.baseCanvas.on("dragleave", () => this.setDragActive(false));
    this.baseCanvas.on("drop", this.drop);

    this.baseCanvas.on("path:created", this.pathCreated);
    this.baseCanvas.on("selection:created", this.selectionCreated);
    this.baseCanvas.on("object:modified", this.objectModified);
    this.baseCanvas.on("mouse:move", this.updateCursor);
  }

  updateState = (): void => {
    this?.callback?.({
      dragActive: this.dragActive,
      currentPage: this.pages.currentIndex + 1,
      totalPages: this.pages.pagesJSON.length,
      currentTool: this.currentTool,
      currentStyle: this.currentStyle,
      canUndo: this.history.history.length > 0,
      canRedo: this.history.redoStack.length > 0,
      keyMap: this.keyboard.keyMap,
    });
  };

  switchTool = async (tool: Tool): Promise<void> => {
    if (tool === Tool.Eraser) {
      if (this.clipboard.cut()) return;
    }

    this.currentTool = tool;
    this.tool = this.handlers[tool];

    if (tool === Tool.Move || this.tool.isBrush) {
      this.baseCanvas.activateSelection();
      this.canvasElement.parentElement.style.display = "none";
      await this.tool.setBrush?.(
        this.baseCanvas.freeDrawingBrush as fabric.BaseBrush,
        this.drawerOptions
      );
    } else {
      this.baseCanvas.deactivateSelection();
      this.canvasElement.parentElement.style.display = "block";
    }

    this.baseCanvas.isDrawingMode = this.tool.isBrush;

    this.updateState();
  };

  windowResize = (): void => {
    clearTimeout(this.resizeCooldown);
    this.resizeCooldown = setTimeout(() => {
      this.canvas.fitToWindow(this.canvasWidth, this.canvasHeight);
      this.baseCanvas.fitToWindow(this.canvasWidth, this.canvasHeight);
    }, 100);
  };

  mouseDown: FabricHandler = async (e) => {
    if (!this.tool.draw) return;

    const { x, y } = this.canvas.getPointer(e.e);
    this.isDown = true;
    this.currentObject = await this.tool.draw(x, y, this.drawerOptions);
    (this.currentObject as ObjectId).id = this.baseCanvas.getNextId();
    this.canvas.add(this.currentObject);
    this.canvas.requestRenderAll();
  };

  mouseMove: FabricHandler = async (e) => {
    if (!(this.tool.draw && this.isDown)) return;

    const { x, y } = this.canvas.getPointer(e.e);
    await this.tool.resize(this.currentObject, x, y, this.strict);
    this.canvas.requestRenderAll();
  };

  mouseUp: FabricHandler = () => {
    if (!this.tool.draw) return;

    this.isDown = false;
    this.baseCanvas.add(fabric.util.object.clone(this.currentObject));
    this.baseCanvas.requestRenderAll();
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
      (iEvent.e as DragEvent).dataTransfer.files
    );
    this.history.execute(historyCommand);
  };

  pathCreated: FabricHandler = (e: PathEvent) => {
    if (this.currentTool === Tool.Pen) {
      e.path.id = this.baseCanvas.getNextId();
      this.history.add([e.path]);
    } else if (this.currentTool === Tool.Eraser) {
      const path = fabric.util.object.clone(e.path);
      this.baseCanvas.remove(e.path);
      const objects = this.baseCanvas
        .getObjects()
        .filter((object) => object.intersectsWithObject(path));
      if (!objects.length) return;
      this.baseCanvas.remove(...objects);
      this.history.remove(objects);
    } else if (this.currentTool === Tool.Laser) {
      setTimeout(() => {
        this.baseCanvas.remove(e.path);
        this.baseCanvas.requestRenderAll();
      }, 1000);
    }
  };

  selectionCreated: FabricHandler = (e) =>
    !this.history.locked && this.history.store(e.selected);

  objectModified: FabricHandler = (e) => {
    this.history.modify(e.target._objects || [e.target]);
    this.history.store(e.target._objects || [e.target]);
  };

  updateCursor: FabricHandler = (iEvent) => {
    const { x, y } = this.baseCanvas.getPointer(iEvent.e);
    this.baseCanvas.cursor = { x, y };
  };
}
