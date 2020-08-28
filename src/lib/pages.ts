import { fabric } from "fabric";
import pdfMake from "pdfmake/build/pdfmake.min";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

export class Page extends fabric.Canvas {
  latestId: number = 0;
  latestCursorX: number;
  latestCursorY: number;

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
    this.requestRenderAll();
  };

  activateSelection = async (): Promise<void> => {
    this.isDrawingMode = false;
    this.selection = true;
    this.forEachObject((object) => {
      object.selectable = true;
    });
  };

  getNextId = async (): Promise<number> => {
    this.latestId += 1;
    return this.latestId;
  };

  getObjectByIds = async (ids: number[]): Promise<fabric.Object[]> => {
    // multiple element case; kind of inefficient
    if (ids.length > 1) {
      return this.getObjects().filter((object: any) => ids.includes(object.id));
    }
    // single element case
    const id = ids[0];
    for (let object of this.getObjects()) {
      if ((object as any).id === id) {
        return [object];
      }
    }
    return [];
  };

  serialize = async (objects: fabric.Object[]): Promise<fabric.Object[]> => {
    return objects.map((object) =>
      (this as any)._toObject(object, "toObject", ["strokeUniform"])
    );
  };

  apply = async (
    ids: number[],
    newObjects: fabric.Object[] | null
  ): Promise<void> => {
    const oldObjects = await this.getObjectByIds(ids);
    if (oldObjects.length) {
      await this.remove(...oldObjects);
    }
    if (newObjects && newObjects.length) {
      fabric.util.enlivenObjects(
        newObjects,
        (objects) => {
          objects.forEach((object: any, i) => {
            object.id = ids[i];
          });
          this.add(...objects);
        },
        "fabric"
      );
    }
    this.requestRenderAll();
  };

  updateCursor = async (e: fabric.IEvent): Promise<void> => {
    const { x, y } = this.getPointer(e.e);
    this.latestCursorX = x;
    this.latestCursorY = y;
  };
}

export class Pages {
  pagesJson: any[] = [defaultPageJSON];
  currentIndex: number = 0;

  constructor(
    public canvas: Page,
    public canvasWidth: number,
    public canvasHeight: number,
    public updateState: () => void
  ) {}

  savePage = async (): Promise<void> => {
    this.pagesJson[this.currentIndex] = await this.canvas.toJSON([
      "id",
      "strokeUniform",
    ]);
  };

  loadPage = async (index: number): Promise<void> => {
    if (index === this.currentIndex) return;
    await this.savePage();
    await this.canvas.loadFromJSON(this.pagesJson[index], null);
    this.currentIndex = index;
    this.updateState();
  };

  newPage = async (): Promise<void> => {
    this.pagesJson.splice(this.currentIndex + 1, 0, defaultPageJSON);
    await this.loadPage(this.currentIndex + 1);
  };

  previousPage = async (): Promise<void> => {
    if (this.currentIndex === 0) return;
    await this.loadPage(this.currentIndex - 1);
  };

  nextOrNewPage = async (): Promise<void> => {
    if (this.currentIndex === this.pagesJson.length - 1) {
      return this.newPage();
    }
    await this.loadPage(this.currentIndex + 1);
  };

  export = async (): Promise<void> => {
    await this.savePage();
    const ratio = 2;
    const content = this.pagesJson.map((page) => {
      this.canvas.loadFromJSON(page, null);
      return { svg: this.canvas.toSVG(), width: this.canvasWidth / ratio };
    });

    const docDefinition = {
      pageSize: {
        width: this.canvasWidth / ratio,
        height: this.canvasHeight / ratio,
      },
      pageMargins: [0, 0],
      content,
    };

    pdfMake.createPdf(docDefinition).download();
  };
}
