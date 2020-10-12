import { fabric } from "fabric";
import pdfMake from "pdfmake/build/pdfmake.min";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

export class Page extends fabric.Canvas {
  cursor: { x: number; y: number };
  latestId: number = 0;
  modified: boolean = false;

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
    await this.canvas.loadFromJSONAsync(this.pagesJson[index]);
    this.currentIndex = index;
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

  saveFile = (): void => {
    this.savePage();
    const fileURL = URL.createObjectURL(
      new Blob([JSON.stringify(this.pagesJson)], {
        type: "application/json",
      })
    );

    const elt = document.createElement("a");
    elt.style.display = "none";
    elt.href = fileURL;
    elt.download = "file.json";
    document.body.appendChild(elt);
    elt.click();
    elt.parentElement.removeChild(elt);

    URL.revokeObjectURL(fileURL);
    this.canvas.modified = false;
  };

  splicePages = async (
    start: number,
    deleteCount: number,
    pages: any[] = []
  ): Promise<void> => {
    await this.loadPage(start);
    this.pagesJson.splice(start + 1, deleteCount, ...pages);
    for (const page of pages) {
      await this.nextOrNewPage(false);
    }
    if (!this.canvas.modified && start === 0) {
      this.pagesJson.shift();
      // can't call load page because it saves the current page
      await this.canvas.loadFromJSONAsync(this.pagesJson[start]);
      this.currentIndex = start;
    }
    this.updateState();
  };

  openFile = async (e: Event): Promise<void> => {
    const file = (e.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () =>
      this.splicePages(
        this.pagesJson.length - 1,
        0,
        JSON.parse(reader.result as string)
      );
    reader.readAsText(file);
  };
}
