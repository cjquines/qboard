import { fabric } from "fabric";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

export const enum Tool {
  Move,
  Line,
  Rectangle,
  Ellipse,
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
    this.isDrawingMode = false;
    this.selection = false;
    this.discardActiveObject();
    this.forEachObject((object) => {
      object.selectable = false;
    });
    this.renderAll();
  };

  activateSelection = async (): Promise<void> => {
    this.isDrawingMode = false;
    this.selection = true;
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

class MoveHandler implements ToolHandler {
  tool: Tool = Tool.Move;

  initialize = async (canvas: Page): Promise<void> => {
    canvas.activateSelection();
  };

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<null> => {
    return null;
  };

  resize = async (
    object: fabric.Object,
    x2: number,
    y2: number
  ): Promise<null> => {
    return null;
  };
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

class RectangleHandler implements ToolHandler {
  tool: Tool = Tool.Rectangle;
  x: number;
  y: number;

  initialize = async (canvas: Page): Promise<void> => {
    canvas.deactivateSelection();
  };

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Rect> => {
    this.x = x;
    this.y = y;

    return new Promise<fabric.Rect>((resolve) => {
      resolve(
        new fabric.Rect({ left: x, top: y, width: x2, height: y2, ...options })
      );
    });
  };

  resize = async (
    object: fabric.Rect,
    x2: number,
    y2: number
  ): Promise<fabric.Rect> => {
    object
      .set({
        originX: this.x > x2 ? "right" : "left",
        originY: this.y > y2 ? "bottom" : "top",
        width: Math.abs(this.x - x2),
        height: Math.abs(this.y - y2),
      })
      .setCoords();

    return new Promise<fabric.Rect>((resolve) => {
      resolve(object);
    });
  };
}

class EllipseHandler implements ToolHandler {
  tool: Tool = Tool.Ellipse;
  x: number;
  y: number;

  initialize = async (canvas: Page): Promise<void> => {
    canvas.deactivateSelection();
  };

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Ellipse> => {
    this.x = x;
    this.y = y;

    return new Promise<fabric.Ellipse>((resolve) => {
      resolve(
        new fabric.Ellipse({ left: x, top: y, rx: x2, ry: y2, ...options })
      );
    });
  };

  resize = async (
    object: fabric.Ellipse,
    x2: number,
    y2: number
  ): Promise<fabric.Ellipse> => {
    object
      .set({
        originX: this.x > x2 ? "right" : "left",
        originY: this.y > y2 ? "bottom" : "top",
        rx: Math.abs(x2 - object.left) / 2,
        ry: Math.abs(y2 - object.top) / 2,
      })
      .setCoords();

    return new Promise<fabric.Ellipse>((resolve) => {
      resolve(object);
    });
  };
}

class PenHandler implements ToolHandler {
  tool: Tool = Tool.Pen;

  initialize = async (canvas: Page): Promise<void> => {
    canvas.deactivateSelection();
    canvas.isDrawingMode = true;
  };

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<null> => {
    return null;
  };

  resize = async (
    object: fabric.Object,
    x2: number,
    y2: number
  ): Promise<null> => {
    return null;
  };
}

export default class QBoard {
  canvas: Page;
  pages: Pages;
  resizeCooldown: any;

  handlers: ToolHandler[] = [
    new MoveHandler(),
    new LineHandler(),
    new RectangleHandler(),
    new EllipseHandler(),
    new PenHandler(),
  ];
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
    canvasElement: HTMLCanvasElement,
    public canvasWidth: number,
    public canvasHeight: number
  ) {
    this.canvas = new Page(canvasElement);
    this.pages = new Pages(this.canvas);

    this.canvas.backgroundColor = "white";
    this.canvas.selection = false;
    this.switchTool(Tool.Move);
    this.windowResize();

    window.onresize = this.windowResize;
    this.canvas.on("mouse:down", this.mouseDown);
    this.canvas.on("mouse:move", this.mouseMove);
    this.canvas.on("mouse:up", this.mouseUp);
  }

  switchTool = async (tool: Tool): Promise<void> => {
    this.tool = this.handlers[tool];
    await this.tool.initialize(this.canvas);
  };

  windowResize = async (): Promise<void> => {
    clearTimeout(this.resizeCooldown);
    this.resizeCooldown = setTimeout(() => {
      this.canvas.fitToWindow(this.canvasWidth, this.canvasHeight);
    }, 100);
  };

  mouseDown = async (e: fabric.IEvent): Promise<void> => {
    const { x, y } = this.canvas.getPointer(e.e);
    this.isDown = true;
    this.currentObject = await this.tool.draw(x, y, this.drawerOptions);
    if (!this.currentObject) return;
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
