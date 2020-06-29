import { fabric } from "fabric";

import { Tool, ToolHandler, Handlers } from "./tools";
import { Page, Pages } from "./pages";
import { HistoryHandler } from "./history";
import { ClipboardHandler } from "./clipboard";
import { StyleHandler } from "./styles";

export interface QBoardState {
  currentPage: number;
  totalPages: number;
}

export default class QBoard {
  baseCanvas: Page;
  canvas: Page;
  pages: Pages;
  history: HistoryHandler;
  clipboard: ClipboardHandler;
  style: StyleHandler;

  handlers: ToolHandler[] = Handlers;
  drawerOptions: fabric.IObjectOptions = {
    fill: "transparent",
    stroke: "#000000",
    strokeWidth: 4,
    selectable: false,
    strokeUniform: true,
  };

  resizeCooldown: any;
  tool: ToolHandler;
  currentObject: any;
  isDown: boolean = false;

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
    this.baseCanvas.freeDrawingBrush.width = 4;
    this.canvas = new Page(canvasElement, {
      selection: false,
      renderOnAddRemove: false,
    });

    this.pages = new Pages(this.baseCanvas);
    this.history = new HistoryHandler(this.baseCanvas, this.pages);
    this.clipboard = new ClipboardHandler(
      this.baseCanvas,
      this.history,
      this.canvasWidth,
      this.canvasHeight
    );
    this.style = new StyleHandler(this.drawerOptions, this.baseCanvas.freeDrawingBrush);

    this.switchTool(Tool.Move);
    this.windowResize();

    window.onresize = this.windowResize;
    this.canvas.on("mouse:down", this.mouseDown);
    this.canvas.on("mouse:move", this.mouseMove);
    this.canvas.on("mouse:up", this.mouseUp);
    this.baseCanvas.on("path:created", this.pathCreated);
    this.baseCanvas.on("object:modified", this.objectModified);
    this.baseCanvas.on("mouse:move", this.baseCanvas.updateCursor);
  }

  switchTool = async (tool: Tool): Promise<void> => {
    if (tool === Tool.Eraser) {
      if (await this.clipboard.cut()) return;
    }

    this.tool = this.handlers[tool];

    if (tool <= Tool.Eraser) {
      this.baseCanvas.activateSelection();
      this.canvasElement.parentElement.style.display = "none";
    } else {
      this.baseCanvas.deactivateSelection();
      this.canvasElement.parentElement.style.display = "block";
    }

    if (tool === Tool.Pen || tool === Tool.Eraser) {
      this.baseCanvas.isDrawingMode = true;
    } else {
      this.baseCanvas.isDrawingMode = false;
    }
  };

  getState = (): QBoardState => {
    return {
      currentPage: this.pages.currentIndex + 1,
      totalPages: this.pages.pagesJson.length,
    };
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
    this.canvas.renderAll();
  };

  mouseMove = async (e: fabric.IEvent): Promise<void> => {
    if (!this.tool.draw) return;

    const { x, y } = this.canvas.getPointer(e.e);
    if (!this.isDown) return;
    await this.tool.resize(this.currentObject, x, y);
    this.canvas.renderAll();
  };

  mouseUp = async (e: fabric.IEvent): Promise<void> => {
    if (!this.tool.draw) return;

    this.isDown = false;
    await this.baseCanvas.add(fabric.util.object.clone(this.currentObject));
    this.baseCanvas.renderAll();
    await this.canvas.remove(this.currentObject);
    this.canvas.renderAll();
    this.history.add([this.currentObject]);
  };

  pathCreated = async (e: any): Promise<void> => {
    if (this.tool === this.handlers[Tool.Pen]) {
      e.path.id = await this.baseCanvas.getNextId();
      this.history.add([e.path]);
    } else if (this.tool === this.handlers[Tool.Eraser]) {
      const path = fabric.util.object.clone(e.path);
      await this.baseCanvas.remove(e.path);
      const objects = this.baseCanvas
        .getObjects()
        .filter((object) => object.intersectsWithObject(path));
      if (!objects.length) return;
      await this.baseCanvas.remove(...objects);
      this.history.remove(objects);
    }
  };

  objectModified = async (e: any): Promise<void> => {
    this.history.save({
      ids: [e.target.id],
      oldObjects: [e.transform.original],
      newObjects: [e.target.toJSON()],
      page: this.pages.currentIndex,
    });
  };
}
