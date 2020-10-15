import { fabric } from "fabric";

import ToolHandler, { Handlers, Tool } from "./tools";
import Page from "./page";
import Pages from "./pages";
import HistoryHandler from "./history";
import ClipboardHandler from "./clipboard";
import StyleHandler, { Dash, Fill, Stroke, Style } from "./styles";
import ActionHandler from "./action";
import KeyboardHandler from "./keyboard";

export interface QBoardState {
  currentPage: number;
  totalPages: number;
  currentTool: Tool;
  currentStyle: Style;
  canUndo: boolean;
  canRedo: boolean;
  keyMap: any;
}

export default class QBoard {
  baseCanvas: Page;
  canvas: Page;
  pages: Pages;
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

  resizeCooldown: any;
  currentTool: Tool;
  tool: ToolHandler;
  currentObject: any;
  isDown = false;
  strict = false;
  callback: (state: QBoardState) => any;

  constructor(
    public canvasElement: HTMLCanvasElement,
    public baseCanvasElement: HTMLCanvasElement,
    public dropArea: HTMLElement,
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

    this.history = new HistoryHandler(
      this.baseCanvas,
      this.pages,
      this.updateState
    );
    this.clipboard = new ClipboardHandler(
      this.baseCanvas,
      this.pages,
      this.history,
      this.canvasWidth,
      this.canvasHeight
    );
    this.style = new StyleHandler(
      this.currentStyle,
      this.drawerOptions,
      this.baseCanvas.freeDrawingBrush,
      this.updateState
    );
    this.action = new ActionHandler(
      this.switchTool,
      this.currentStyle,
      this.pages,
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

    this.dropArea.ondragenter = this.dragEnter;
    this.dropArea.ondragleave = this.dragLeave;
    this.baseCanvas.on("drop", this.drop);

    this.baseCanvas.on("path:created", this.pathCreated);
    this.baseCanvas.on("selection:created", this.selectionCreated);
    this.baseCanvas.on("object:modified", this.objectModified);
    this.baseCanvas.on("mouse:move", this.updateCursor);
  }

  updateState = (): void => {
    this?.callback?.({
      currentPage: this.pages.currentIndex + 1,
      totalPages: this.pages.pagesJson.length,
      currentTool: this.currentTool,
      currentStyle: this.currentStyle,
      canUndo: Boolean(this.history.history.length),
      canRedo: Boolean(this.history.redoStack.length),
      keyMap: this.keyboard.keyMap,
    });
  };

  switchTool = async (tool: Tool): Promise<void> => {
    if (tool === Tool.Eraser) {
      if (await this.clipboard.cut()) return;
    }

    this.currentTool = tool;
    this.tool = this.handlers[tool];

    if (tool === Tool.Move || this.tool.isBrush) {
      await this.baseCanvas.activateSelection();
      this.canvasElement.parentElement.style.display = "none";
      await this.tool.setBrush?.(
        this.baseCanvas.freeDrawingBrush,
        this.drawerOptions
      );
    } else {
      await this.baseCanvas.deactivateSelection();
      this.canvasElement.parentElement.style.display = "block";
    }

    this.baseCanvas.isDrawingMode = this.tool.isBrush;

    this.updateState();
  };

  windowResize = async (): Promise<void> => {
    clearTimeout(this.resizeCooldown);
    this.resizeCooldown = setTimeout(() => {
      void this.canvas.fitToWindow(this.canvasWidth, this.canvasHeight);
      void this.baseCanvas.fitToWindow(this.canvasWidth, this.canvasHeight);
    }, 100);
  };

  mouseDown = async (e: fabric.IEvent): Promise<void> => {
    if (!this.tool.draw) return;

    const { x, y } = this.canvas.getPointer(e.e);
    this.isDown = true;
    this.currentObject = await this.tool.draw(x, y, this.drawerOptions);
    this.currentObject.id = await this.baseCanvas.getNextId();
    await this.canvas.add(this.currentObject);
    this.canvas.requestRenderAll();
  };

  mouseMove = async (e: fabric.IEvent): Promise<void> => {
    if (!(this.tool.draw && this.isDown)) return;

    const { x, y } = this.canvas.getPointer(e.e);
    await this.tool.resize(this.currentObject, x, y, this.strict);
    this.canvas.requestRenderAll();
  };

  mouseUp = async (): Promise<void> => {
    if (!this.tool.draw) return;

    this.isDown = false;
    await this.baseCanvas.add(fabric.util.object.clone(this.currentObject));
    this.baseCanvas.requestRenderAll();
    await this.canvas.remove(this.currentObject);
    this.canvas.requestRenderAll();
    await this.history.add([this.currentObject]);
  };

  dragEnter = (): void => this.dropArea.classList.add("file-drop-active");

  dragLeave = (): void => this.dropArea.classList.remove("file-drop-active");

  drop = async (iEvent: fabric.IEvent): Promise<void> => {
    iEvent.e.stopPropagation();
    iEvent.e.preventDefault();
    this.updateCursor(iEvent);
    this.dragLeave();
    const imgs = await this.pages.processFiles(
      (iEvent.e as DragEvent).dataTransfer.files
    );
    return this.history.add(imgs.flat());
  };

  pathCreated = async (e: any): Promise<void> => {
    if (this.currentTool === Tool.Pen) {
      e.path.id = await this.baseCanvas.getNextId();
      await this.history.add([e.path]);
    } else if (this.currentTool === Tool.Eraser) {
      const path = fabric.util.object.clone(e.path);
      await this.baseCanvas.remove(e.path);
      const objects = this.baseCanvas
        .getObjects()
        .filter((object) => object.intersectsWithObject(path));
      if (!objects.length) return;
      this.baseCanvas.remove(...objects);
      await this.history.remove(objects);
    } else if (this.currentTool === Tool.Laser) {
      setTimeout(async () => {
        await this.baseCanvas.remove(e.path);
        this.baseCanvas.requestRenderAll();
      }, 1000);
    }
  };

  selectionCreated = (e: any): Promise<void> => this.history.store(e.selected);

  objectModified = async (e: any): Promise<void> =>
    this.history.modify(e.target._objects || [e.target]);

  updateCursor = (e: fabric.IEvent): void => {
    const { x, y } = this.baseCanvas.getPointer(e.e);
    this.baseCanvas.cursor = { x, y };
  };
}
