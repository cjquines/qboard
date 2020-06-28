import { fabric } from "fabric";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

export class Page {
  canvas: fabric.Canvas;

  constructor(
    canvasElement: HTMLCanvasElement,
    public canvasWidth: number,
    public canvasHeight: number
  ) {
    this.canvas = new fabric.Canvas(canvasElement);
    this.canvas.backgroundColor = "white";

    // temporary rectangle for now:
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "red",
      width: 100,
      height: 100,
    });
    this.canvas.add(rect);
  }

  resize = (width: number, height: number): void => {
    const widthRatio = width / this.canvasWidth;
    const heightRatio = height / this.canvasHeight;
    this.canvas.setZoom(Math.min(widthRatio, heightRatio));
    this.canvas.setWidth(this.canvasWidth * this.canvas.getZoom());
    this.canvas.setHeight(this.canvasHeight * this.canvas.getZoom());
  };
}

const enum Tool {
  Line,
  Move,
  Pen,
}

interface ToolHandler {
  tool: Tool;

  draw: (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ) => fabric.Object | null;

  resize: (
    object: fabric.Object,
    x2: number,
    y2: number
  ) => fabric.Object | null;
}

class LineHandler implements ToolHandler {
  tool: Tool = Tool.Line;

  draw = (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): fabric.Object | null => {
    return new fabric.Line([x, y, x2, y2], options);
  };

  resize = (
    object: fabric.Line,
    x2: number,
    y2: number
  ): fabric.Object | null => {
    object.set({ x2, y2 }).setCoords();
    return object;
  };
}

export class PageContainer {
  pagesJson: any[] = [defaultPageJSON];
  currentIndex: number = 0;
  resizeCooldown: any;
  tool: ToolHandler;
  handlers: ToolHandler[];
  object: fabric.Object;
  drawerOptions: fabric.IObjectOptions;
  isDown: boolean = false;

  constructor(public page: Page) {
    this.handlers = [
      new LineHandler(),
    ];
    this.tool = this.handlers[Tool.Line];

    this.resizeCooldown = setTimeout(this.fitPageToWindow, 0);
    window.onresize = (): void => {
      clearTimeout(this.resizeCooldown);
      this.resizeCooldown = setTimeout(this.fitPageToWindow, 100);
    };
    this.drawerOptions = {
      stroke: 'black',
      strokeWidth: 1,
      selectable: true,
      strokeUniform: true
    };

    this.page.canvas.on("mouse:down", (o) => {
      const pointer = this.page.canvas.getPointer(o.e);
      this.mouseDown(pointer.x, pointer.y);
    });

    this.page.canvas.on("mouse:move", (o) => {
      const pointer = this.page.canvas.getPointer(o.e);
      this.mouseMove(pointer.x, pointer.y);
    });

    this.page.canvas.on("mouse:up", (o) => {
      this.isDown = false;
    })
  }

  fitPageToWindow = (): void => {
    this.page.resize(window.innerWidth, window.innerHeight);
  };

  savePage = (): void => {
    this.pagesJson[this.currentIndex] = this.page.canvas.toJSON();
  };

  loadPage = (index: number): void => {
    this.savePage();
    this.page.canvas.loadFromJSON(this.pagesJson[index], null);
    this.currentIndex = index;
  };

  newPage = (): void => {
    this.pagesJson.splice(this.currentIndex + 1, 0, defaultPageJSON);
    this.loadPage(this.currentIndex + 1);
  };

  mouseDown = (x: number, y: number): void => {
    this.isDown = true;
    this.object = this.tool.draw(x, y, this.drawerOptions);
    this.page.canvas.add(this.object);
    this.page.canvas.renderAll();
  }

  mouseMove = (x: number, y: number): void => {
    if (!this.isDown) return;
    this.tool.resize(this.object, x, y);
    this.page.canvas.renderAll();
  }
}
