import pdfMake from "pdfmake/build/pdfmake.min";

import Page from "./page";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

export default class Pages {
  pagesJson: any[] = [defaultPageJSON];
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
    pages: any[] = [defaultPageJSON]
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

  insertPages = async (index: number, pages: any[]): Promise<number> => {
    this.pagesJson.splice(index, 0, ...pages);
    return this.loadPage(index);
  };
}
