import { fabric } from "fabric";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

const enum Tool {
  Move,
  Line,
  Pen,
}

class Page extends fabric.Canvas {
  fitToWindow = async (
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> => {
    const widthRatio = window.innerWidth / canvasWidth;
    const heightRatio = window.innerHeight / canvasHeight;
    this.setZoom(Math.min(widthRatio, heightRatio));
    this.setWidth(canvasWidth * this.getZoom());
    this.setHeight(canvasHeight * this.getZoom());
  };

  deactivateSelection = async (): Promise<void> => {
    this.selection = false;
    this.discardActiveObject();
    this.forEachObject((object) => {
      object.selectable = false;
    });
  };

  activateSelection = async (): Promise<void> => {
    this.selection = true;
    this.discardActiveObject();
    this.forEachObject((object) => {
      object.selectable = true;
    });
  };
}

class Pages {
  pagesJson: any[] = [defaultPageJSON];
  currentIndex: number = 0;

  constructor(public canvas: Page) {}

  savePage = (): void => {
    this.pagesJson[this.currentIndex] = this.canvas.toJSON();
  };

  loadPage = (index: number): void => {
    this.savePage();
    this.canvas.loadFromJSON(this.pagesJson[index], null);
    this.currentIndex = index;
  };

  newPage = (): void => {
    this.pagesJson.splice(this.currentIndex + 1, 0, defaultPageJSON);
    this.loadPage(this.currentIndex + 1);
  };
}

interface ToolHandler {
  tool: Tool;

  initialize: (canvas: Page) => Promise<void>;

  draw: (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ) => Promise<fabric.Object | null>;

  resize: (
    object: fabric.Object,
    x2: number,
    y2: number
  ) => Promise<fabric.Object | null>;
}

class LineHandler implements ToolHandler {
  tool: Tool = Tool.Line;

  initialize = async (canvas: Page): Promise<void> => {
    canvas.deactivateSelection();
  };

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Line> => {
    return new Promise<fabric.Line>((resolve) => {
      resolve(new fabric.Line([x, y, x2, y2], options));
    });
  };

  resize = async (
    object: fabric.Line,
    x2: number,
    y2: number
  ): Promise<fabric.Line> => {
    object.set({ x2, y2 }).setCoords();
    return new Promise<fabric.Line>((resolve) => {
      resolve(object);
    });
  };
}

export default class QBoard {
  canvas: Page;
  pages: Pages;

  handlers: ToolHandler[] = [new MoveHandler(), new LineHandler()];
  tool: ToolHandler = this.handlers[Tool.Line];
  drawerOptions: fabric.IObjectOptions = {
    stroke: "black",
    strokeWidth: 1,
    selectable: false,
    strokeUniform: true,
  };

  currentObject: fabric.Object;
  isDown: boolean = false;

  constructor(
    canvasElement: HTMLCanvasElement,
    public canvasWidth: number,
    public canvasHeight: number
  ) {
    this.canvas = new Page(canvasElement);
    this.canvas.backgroundColor = "white";
    this.canvas.selection = false;
    this.pages = new Pages(this.canvas);
    this.windowResize();

    // temporary rectangle for now:
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "red",
      width: 100,
      height: 100,
    });
    this.canvas.add(rect);

    window.onresize = this.windowResize;
    this.canvas.on("mouse:down", this.mouseDown);
    this.canvas.on("mouse:move", this.mouseMove);
    this.canvas.on("mouse:up", this.mouseUp);
  }

  fitPageToWindow = async (): Promise<void> => {
    const widthRatio = window.innerWidth / this.canvasWidth;
    const heightRatio = window.innerHeight / this.canvasHeight;
    this.canvas.setZoom(Math.min(widthRatio, heightRatio));
    this.canvas.setWidth(this.canvasWidth * this.canvas.getZoom());
    this.canvas.setHeight(this.canvasHeight * this.canvas.getZoom());
  };

  deactivateSelection = async (): Promise<void> => {
    this.canvas.discardActiveObject();
    this.canvas.forEachObject((object) => {
      object.selectable = false;
    });
  };

  windowResize = async (): Promise<void> => {
    this.canvas.fitToWindow(this.canvasWidth, this.canvasHeight);
  };

  mouseDown = async (e: fabric.IEvent): Promise<void> => {
    console.log(this);
    const { x, y } = this.canvas.getPointer(e.e);
    this.isDown = true;
    this.currentObject = await this.tool.draw(x, y, this.drawerOptions);
    this.canvas.add(this.currentObject);
    this.canvas.renderAll();
  };

  mouseMove = async (e: fabric.IEvent): Promise<void> => {
    const { x, y } = this.canvas.getPointer(e.e);
    if (!this.isDown) return;
    await this.tool.resize(this.currentObject, x, y);
    this.canvas.renderAll();
  };

  mouseUp = async (e: fabric.IEvent): Promise<void> => {
    this.isDown = false;
  };
}
