import pdfMake from "pdfmake/build/pdfmake.min";
import { fabric } from "fabric";

import Page from "./page";
import { HistoryCommand } from "./history";

const defaultPageJSON = ({
  version: "3.6.3",
  objects: [],
  background: "white",
} as unknown) as string;

const AsyncReader = (file: File): Promise<FileReader> =>
  new Promise<FileReader>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });

export type FileHandlerResponse = {
  action: "none" | "image" | "json";
  history?: HistoryCommand;
};

export default class Pages {
  pagesJson: string[] = [defaultPageJSON];
  currentIndex = 0;

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

  loadPage = async (
    index: number,
    fromFile = false,
    force = false
  ): Promise<number> => {
    if (index === this.currentIndex && !force) return index;
    if (!fromFile) this.savePage();
    await this.canvas.loadFromJSONAsync(this.pagesJson[index]);
    this.currentIndex = index;
    if (!fromFile || force) this.updateState();
    return index;
  };

  newPage = async (fromFile = false): Promise<number> => {
    this.pagesJson.splice(this.currentIndex + 1, 0, defaultPageJSON);
    return this.loadPage(this.currentIndex + 1, fromFile);
  };

  previousPage = async (): Promise<number> => {
    if (this.currentIndex === 0) return 0;
    return this.loadPage(this.currentIndex - 1);
  };

  nextOrNewPage = async (fromFile = false): Promise<number> => {
    if (this.currentIndex === this.pagesJson.length - 1) {
      return this.newPage(fromFile);
    }
    return this.loadPage(this.currentIndex + 1, fromFile);
  };

  export = async (): Promise<void> => {
    this.savePage();
    const ratio = 2;
    const content = [];
    const currentindexcopy = this.currentIndex;
    for (const page of this.pagesJson) {
      await this.canvas.loadFromJSONAsync(page);
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

    await this.canvas.loadFromJSONAsync(this.pagesJson[currentindexcopy]);
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

  overwritePages = async (
    pages: string[] = [defaultPageJSON]
  ): Promise<boolean> => {
    const response = window.confirm(
      "Your work will be overwritten. Are you sure you wish to continue?"
    );
    if (!response) return false;

    this.pagesJson = pages;
    await this.loadPage(0, true, true);
    this.canvas.modified = false;
    return true;
  };

  insertPages = async (index: number, pages: string[]): Promise<number> => {
    this.pagesJson.splice(index, 0, ...pages);
    return this.loadPage(index);
  };

  acceptFile = async (files: FileList): Promise<FileHandlerResponse> => {
    if (!files.length) return { action: "none" };
    const [file] = files;

    if (file.type.startsWith("image/")) {
      return {
        action: "image",
        history: { add: await this.handleImage(file) },
      };
    }

    if (file.type === "application/json") {
      await this.openFile(file);
      return {
        action: "json",
        history: { clear: [true] },
      };
    }
  };

  openFile = async (file: File): Promise<boolean> => {
    this.savePage();
    const asyncReader = AsyncReader(file);
    return this.overwritePages(
      JSON.parse((await asyncReader).result.toString())
    );
  };

  private handleImage = async (file: File): Promise<fabric.Object[]> =>
    new Promise<fabric.Object[]>((resolve) => {
      const fileURL = window.URL.createObjectURL(file);
      fabric.Image.fromURL(fileURL, (obj: fabric.Image) => {
        resolve(
          this.canvas.placeObject((obj as unknown) as fabric.ActiveSelection)
        );
      });
    });

  private handleJSON = async (file: File): Promise<number> => {
    const asyncReader = AsyncReader(file);
    return this.insertPages(
      this.currentIndex + 1,
      JSON.parse((await asyncReader).result.toString())
    );
  };

  processFiles = async (files: FileList): Promise<HistoryCommand> => {
    const images = [];
    await Promise.all(
      [...files].map(async (file) => {
        if (file.type.startsWith("image/")) {
          images.push(await this.handleImage(file));
        }
        if (file.type === "application/json") {
          return this.handleJSON(file);
        }
      })
    );
    return {
      add: images.flat(),
    };
  };
}
