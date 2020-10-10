import { fabric } from "fabric";
import pdfMake from "pdfmake/build/pdfmake.min";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

export class Page extends fabric.Canvas {
  latestId: number = 0;
  cursor: { x: number; y: number };

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

  getObjectByIds = (ids: number[]): fabric.Object[] => {
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

  apply = (ids: number[], newObjects: fabric.Object[] | null): void => {
    const oldObjects = this.getObjectByIds(ids);
    if (oldObjects.length) {
      this.remove(...oldObjects);
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

  loadFromJSONAsync = async (json: any) =>
    new Promise<void>((resolve) => {
      super.loadFromJSON(json, () => {
        resolve();
      });
    });
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

  savePage = (): void => {
    this.pagesJson[this.currentIndex] = this.canvas.toJSON([
      "id",
      "strokeUniform",
    ]);
  };

  loadPage = async (index: number, reload: boolean = true): Promise<number> => {
    if (index === this.currentIndex) return index;
    this.savePage();
    this.currentIndex = index;
    await this.canvas.loadFromJSONAsync(this.pagesJson[index]);
    if (reload) this.updateState();
    return index;
  };

  newPage = async (reload: boolean = true): Promise<number> => {
    this.pagesJson.splice(this.currentIndex + 1, 0, defaultPageJSON);
    return this.loadPage(this.currentIndex + 1, reload);
  };

  previousPage = async (): Promise<number> => {
    if (this.currentIndex === 0) return 0;
    return this.loadPage(this.currentIndex - 1);
  };

  nextOrNewPage = async (reload: boolean = true): Promise<number> => {
    if (this.currentIndex === this.pagesJson.length - 1) {
      return this.newPage(reload);
    }
    return this.loadPage(this.currentIndex + 1, reload);
  };

  export = async (): Promise<void> => {
    this.savePage();
    const ratio = 2;
    const content = [];
    for (let i = 0; i < this.pagesJson.length; i++) {
      await this.loadPage(i);
      content.push({
        svg: this.canvas.toSVG(),
        width: this.canvasWidth / ratio,
      });
    }

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

  jsonify = (): string => {
    this.savePage();
    return JSON.stringify(this.pagesJson);
  };

  // It doesn't exactly splice _Pages_ (insert Page objects) as the name claims it does but whatever
  // It accepts an array instead of rest parameters, for convenience when exposing this API
  // pages is an array of pure objects
  // @returns array of objects in the union of all the pages
  // FIXME: Do I need to worry about concurrency and parellelism issues here (we use the pagesJson once by providing a default value for index and then once in the body)? It shouldn't be an issue because it should only be called by something that respects the locked property but idk
  splicePages = async (
    index: number = this.pagesJson.length - 1,
    deleteCount: number,
    pages: any[] = []
  ): Promise<any[]> => {
    await this.loadPage(index);

    this.pagesJson.splice(index + 1, deleteCount, ...pages);

    for (const page of pages) {
      await this.nextOrNewPage(false);
    }

    this.updateState();

    // TODO: this is the wrong type of objects to be put into history
    return pages.flatMap((page) => page.objects);
  };
}
