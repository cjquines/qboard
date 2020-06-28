import { fabric } from "fabric";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

export const enum Tool {
  Move,
  Pen,
  Eraser,
  Line,
  Rectangle,
  Ellipse,
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

  tryDeleting = async (): Promise<boolean> => {
    const objects = this.getActiveObjects();
    if (!objects.length) return false;
    this.discardActiveObject();
    await this.remove(...objects);
    return true;
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

class EraserHandler implements ToolHandler {
  tool: Tool = Tool.Eraser;

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
  baseCanvas: Page;
  canvas: Page;
  pages: Pages;
  resizeCooldown: any;

  handlers: ToolHandler[] = [
    new MoveHandler(),
    new PenHandler(),
    new EraserHandler(),
    new LineHandler(),
    new RectangleHandler(),
    new EllipseHandler(),
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
    if (
      this.tool === this.handlers[Tool.Move] ||
      this.tool === this.handlers[Tool.Pen] ||
      this.tool === this.handlers[Tool.Eraser]
    )
      return;

    const { x, y } = this.canvas.getPointer(e.e);
    this.isDown = true;
    this.currentObject = await this.tool.draw(x, y, this.drawerOptions);
    this.canvas.add(this.currentObject);
    this.canvas.renderAll();
  };

  mouseMove = async (e: fabric.IEvent): Promise<void> => {
    if (
      this.tool === this.handlers[Tool.Move] ||
      this.tool === this.handlers[Tool.Pen] ||
      this.tool === this.handlers[Tool.Eraser]
    )
      return;

    const { x, y } = this.canvas.getPointer(e.e);
    if (!this.isDown) return;
    await this.tool.resize(this.currentObject, x, y);
    this.canvas.renderAll();
  };

  mouseUp = async (e: fabric.IEvent): Promise<void> => {
    if (
      this.tool === this.handlers[Tool.Move] ||
      this.tool === this.handlers[Tool.Pen] ||
      this.tool === this.handlers[Tool.Eraser]
    )
      return;

    this.isDown = false;
    await this.baseCanvas.add(fabric.util.object.clone(this.currentObject));
    await this.canvas.remove(this.currentObject);
    this.baseCanvas.renderAll();
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
