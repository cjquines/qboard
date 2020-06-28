import { fabric } from "fabric";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

export class Page extends fabric.Canvas {
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

export class Pages {
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
