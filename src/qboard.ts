import { fabric } from "fabric";

const defaultPageJSON = {
  version: "3.6.3", objects: [], background: "white"
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

export class PageContainer {
  pagesJson: any[] = [defaultPageJSON];
  currentIndex: number = 0;
  resizeCooldown: any;

  constructor(public page: Page) {
    this.resizeCooldown = setTimeout(this.fitPageToWindow, 0);
    window.onresize = (): void => {
      clearTimeout(this.resizeCooldown);
      this.resizeCooldown = setTimeout(this.fitPageToWindow, 100);
    };
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
}
