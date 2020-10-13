import { fabric } from "fabric";
import pdfMake from "pdfmake/build/pdfmake.min";

import { Page } from "./page";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

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

  loadPage = async (
    index: number,
    fromFile: boolean = false
  ): Promise<number> => {
    if (!fromFile && index === this.currentIndex) return index;
    if (!fromFile) this.savePage();
    await this.canvas.loadFromJSONAsync(this.pagesJson[index]);
    this.currentIndex = index;
    if (!fromFile) this.updateState();
    return index;
  };

  newPage = async (fromFile: boolean = false): Promise<number> => {
    this.pagesJson.splice(this.currentIndex + 1, 0, defaultPageJSON);
    return this.loadPage(this.currentIndex + 1, fromFile);
  };

  previousPage = async (): Promise<number> => {
    if (this.currentIndex === 0) return 0;
    return this.loadPage(this.currentIndex - 1);
  };

  nextOrNewPage = async (fromFile: boolean = false): Promise<number> => {
    if (this.currentIndex === this.pagesJson.length - 1) {
      return this.newPage(fromFile);
    }
    return this.loadPage(this.currentIndex + 1, fromFile);
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
      await this.nextOrNewPage(true);
    }
    if (!this.canvas.modified && start === 0) {
      this.pagesJson.shift();
      await this.loadPage(0, true);
      this.canvas.modified = true;
    }
    this.updateState();
  };

  openFile = async (files: FileList): Promise<void> => {
    if (!files.length) return;
    this.savePage();
    for (const file of files) {
      const asyncReader = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.splicePages(
            this.pagesJson.length - 1,
            0,
            JSON.parse(reader.result as string)
          );
          resolve();
        };
        reader.readAsText(file);
      });
      await asyncReader;
    }
  };
}
