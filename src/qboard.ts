import { fabric } from "fabric";

import { Tool, ToolHandler, Handlers } from "./tools";
import { Page, Pages } from "./pages";

export default class QBoard {
  baseCanvas: Page;
  canvas: Page;
  pages: Pages;
  resizeCooldown: any;

  handlers: ToolHandler[] = Handlers;
  drawerOptions: fabric.IObjectOptions = {
    fill: "transparent",
    stroke: "black",
    strokeWidth: 1,
    selectable: false,
    strokeUniform: true,
  };

  tool: ToolHandler;
  currentObject: fabric.Object;
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
    this.canvas = new Page(canvasElement, {
      selection: false,
      renderOnAddRemove: false,
    });
    this.pages = new Pages(this.baseCanvas);

    this.switchTool(Tool.Move);
    this.windowResize();

    window.onresize = this.windowResize;
    this.canvas.on("mouse:down", this.mouseDown);
    this.canvas.on("mouse:move", this.mouseMove);
    this.canvas.on("mouse:up", this.mouseUp);
    this.baseCanvas.on("path:created", this.pathCreated);
  }

  switchTool = async (tool: Tool): Promise<void> => {
    if (tool === Tool.Eraser) {
      const deleted = await this.baseCanvas.tryDeleting();
      if (deleted) {
        this.baseCanvas.renderAll();
        return;
      }
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
  };

  pathCreated = async (e): Promise<void> => {
    if (this.tool !== this.handlers[Tool.Eraser]) return;

    const { path } = e;
    const objects = this.baseCanvas
      .getObjects()
      .filter((object) => object.intersectsWithObject(path));
    // doesn't quite work because it intersects with bounding box
    await this.baseCanvas.remove(path, ...objects);
    this.baseCanvas.renderAll();
  };
}
