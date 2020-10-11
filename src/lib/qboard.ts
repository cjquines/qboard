import { fabric } from "fabric";

import { Handlers, Tool, ToolHandler } from "./tools";
import { Page, Pages } from "./pages";
import { HistoryHandler } from "./history";
import { ClipboardHandler } from "./clipboard";
import { Dash, Fill, Stroke, Style, StyleHandler } from "./styles";
import { KeyboardHandler } from "./keyboard";
import { ActionHandler } from "./action";

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
  keyboard: KeyboardHandler;
  action: ActionHandler;

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
  isDown: boolean = false;
  isModified: boolean = false;
  strict: boolean = false;
  callback: (state: QBoardState) => any;

  constructor(
    public canvasElement: HTMLCanvasElement,
    public baseCanvasElement: HTMLCanvasElement,
    public canvasWidth: number,
    public canvasHeight: number
  ) {
    this.baseCanvas = new Page(baseCanvasElement, {
      backgroundColor: "white",
      selection: false,
      renderOnAddRemove: false,
    });
    this.canvas = new Page(canvasElement, {
      selection: false,
      renderOnAddRemove: false,
    });
    this.pages = new Pages(
      this.baseCanvas,
      this.canvasWidth,
      this.canvasHeight,
      this.updateState,
      () => (this.isModified = false)
    );

    this.history = new HistoryHandler(
      this.baseCanvas,
      this.pages,
      this.updateState,
      () => (this.isModified = true)
    );
    this.clipboard = new ClipboardHandler(
      this.baseCanvas,
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
      this.style.set,
      this.updateState
    );
    this.keyboard = new KeyboardHandler(
      this.action.doAction,
      (strict: boolean) => {
        this.strict = strict;
      },
      this.updateState
    );

    this.switchTool(Tool.Move);
    this.windowResize();

    window.onresize = this.windowResize;
    window.onbeforeunload = () => this.isModified || null;

    // TODO: move these inner calls to whichever class you think is good

    // @ts-ignore for dev purposes
    window.exportJSON = this.pages.jsonify;

    // Takes an array (not a JSONified string but you can change that with a JSON.parse) pages (as pure objects) and adds them to the pagesJson array beginning one unit to the right of the current page. Is obvious once you open the splicePages function
    // @ts-ignore for dev purposes
    window.loadQ = async (pages): Promise<void> => {
      const objects = await this.pages.splicePages(undefined, 0, pages);
      // await this.history.add(objects);
    };

    this.canvas.on("mouse:down", this.mouseDown);
    this.canvas.on("mouse:move", this.mouseMove);
    this.canvas.on("mouse:up", this.mouseUp);
    this.baseCanvas.on("path:created", this.pathCreated);
    this.baseCanvas.on("selection:created", this.selectionCreated);
    this.baseCanvas.on("object:modified", this.objectModified);
    this.baseCanvas.on("mouse:move", this.updateCursor);
  }

  updateState = (): void => {
    this.callback &&
      this.callback({
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
      await this.tool.setBrush(
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
      this.canvas.fitToWindow(this.canvasWidth, this.canvasHeight);
      this.baseCanvas.fitToWindow(this.canvasWidth, this.canvasHeight);
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
    if (!this.tool.draw) return;

    const { x, y } = this.canvas.getPointer(e.e);
    if (!this.isDown) return;
    await this.tool.resize(this.currentObject, x, y, this.strict);
    this.canvas.requestRenderAll();
  };

  mouseUp = async (e: fabric.IEvent): Promise<void> => {
    if (!this.tool.draw) return;

    this.isDown = false;
    await this.baseCanvas.add(fabric.util.object.clone(this.currentObject));
    this.baseCanvas.requestRenderAll();
    await this.canvas.remove(this.currentObject);
    this.canvas.requestRenderAll();
    await this.history.add([this.currentObject]);
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

  updateCursor = async (e: fabric.IEvent): Promise<void> => {
    const { x, y } = this.baseCanvas.getPointer(e.e);
    this.baseCanvas.cursor = { x, y };
  };
}
