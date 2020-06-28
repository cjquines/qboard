import { fabric } from "fabric";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

const enum Tool {
  Line,
  Move,
  Pen,
}

class Pages {
  pagesJson: any[] = [defaultPageJSON];
  currentIndex: number = 0;

  constructor(public canvas: fabric.Canvas) {}

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
  canvas: fabric.Canvas;
  pages: Pages;

  handlers: ToolHandler[] = [new LineHandler()];
  tool: ToolHandler = this.handlers[Tool.Line];
  drawerOptions: fabric.IObjectOptions = {
    stroke: "black",
    strokeWidth: 1,
    selectable: true,
    strokeUniform: true,
  };

  currentObject: fabric.Object;
  isDown: boolean = false;

  constructor(
    canvasElement: HTMLCanvasElement,
    public canvasWidth: number,
    public canvasHeight: number
  ) {
    this.canvas = new fabric.Canvas(canvasElement);
    this.canvas.backgroundColor = "white";
    this.canvas.selection = false;
    this.pages = new Pages(this.canvas);
    this.fitPageToWindow();

    // temporary rectangle for now:
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "red",
      width: 100,
      height: 100,
    });
    this.canvas.add(rect);

    window.onresize = this.fitPageToWindow;
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

  mouseDown = async (e: fabric.IEvent): Promise<void> => {
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
