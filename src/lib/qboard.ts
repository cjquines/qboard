import { fabric } from "fabric";

import Handlers, { ToolHandler } from "./tools";
import Page, { ObjectId } from "./page";
import Pages from "./pages";
import FileHandler from "./files";
import HistoryHandler from "./history";
import ClipboardHandler from "./clipboard";
import StyleHandler, { Dash, Fill, Stroke, Style } from "./styles";
import ActionHandler from "./action";
import KeyboardHandler, { KeyMap } from "./keyboard";

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

  handlers: { [key: string]: ToolHandler };
  activeTool: ToolHandler;
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
      this.baseCanvas,
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

    this.handlers = Handlers.from(
      this.baseCanvas,
      this.history,
      this.clipboard
    );
    // an instance which has no effect (deactivate method is trivial)
    this.activeTool = new ToolHandler(
      this.baseCanvas,
      this.history,
      this.clipboard
    );
    void this.switchTool();

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
      currentStyle: this.currentStyle,
      canUndo: this.history.history.length > 0,
      canRedo: this.history.redoStack.length > 0,
      keyMap: this.keyboard.keyMap,
    });
  };

  switchTool = async (
    tool: ToolHandler = this.handlers.Move
  ): Promise<void> => {
    if (!tool.activate()) return;

    this.activeTool.deactivate();

    if (this.activeTool.isBrush || this.activeTool.requiresBase) {
      await this.baseCanvas.activateSelection();
      this.canvasElement.parentElement.style.display = "none";
      await this.activeTool.setBrush?.(
        this.baseCanvas.freeDrawingBrush as fabric.BaseBrush,
        this.drawerOptions
      );
    } else {
      await this.baseCanvas.deactivateSelection();
      this.canvasElement.parentElement.style.display = "block";
    }

    this.activeTool = tool;

    this.baseCanvas.isDrawingMode = this.activeTool.isBrush;

    this.updateState();
  };

  windowResize = async (): Promise<void> => {
    clearTimeout(this.resizeCooldown);
    this.resizeCooldown = setTimeout(async () => {
      await this.canvas.fitToWindow(this.canvasWidth, this.canvasHeight);
      await this.baseCanvas.fitToWindow(this.canvasWidth, this.canvasHeight);
    }, 100);
  };

  mouseDown = async (e: fabric.IEvent): Promise<void> => {
    if (!this.activeTool.isDrawing) return;

    const { x, y } = this.canvas.getPointer(e.e);
    this.isDown = true;
    this.currentObject = await this.activeTool.draw(x, y, this.drawerOptions);
    (this.currentObject as ObjectId).id = await this.baseCanvas.getNextId();
    this.canvas.add(this.currentObject);
    this.canvas.requestRenderAll();
  };

  mouseMove = async (e: fabric.IEvent): Promise<void> => {
    if (!(this.activeTool.isDrawing && this.isDown)) return;

    const { x, y } = this.canvas.getPointer(e.e);
    await this.activeTool.resize(this.currentObject, x, y, this.strict);
    this.canvas.requestRenderAll();
  };

  mouseUp = async (): Promise<void> => {
    if (!this.activeTool.isDrawing) return;

    this.isDown = false;
    this.baseCanvas.add(fabric.util.object.clone(this.currentObject));
    this.baseCanvas.requestRenderAll();
    this.canvas.remove(this.currentObject);
    this.canvas.requestRenderAll();
    await this.history.add([this.currentObject]);
  };

  setDragActive = (state: boolean): void => {
    this.dragActive = state;
    this.updateState();
  };

  drop = async (iEvent: fabric.IEvent): Promise<void> => {
    iEvent.e.stopPropagation();
    iEvent.e.preventDefault();
    this.updateCursor(iEvent);
    this.setDragActive(false);

    const historyCommand = await this.files.processFiles(
      (iEvent.e as DragEvent).dataTransfer.files
    );
    await this.history.execute(historyCommand);
  };

  pathCreated = async (e: any): Promise<void> => {
    return this.activeTool.pathCreated(e);
  };

  selectionCreated = (e: any): Promise<void> => this.history.store(e.selected);

  objectModified = async (e: any): Promise<void> =>
    this.history.modify(e.target._objects || [e.target]);

  updateCursor = (e: fabric.IEvent): void => {
    const { x, y } = this.baseCanvas.getPointer(e.e);
    this.baseCanvas.cursor = { x, y };
  };
}
