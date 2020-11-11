import pdfMake from "pdfmake/build/pdfmake.min";
import { fabric } from "fabric";

import Page from "./page";
import { JSONWriter } from "./files";

export type PageJSON = {
  version: string;
  objects: fabric.Object[];
  background: string;
};

const defaultPageJSON: PageJSON = {
  version: "4.2.0",
  objects: [],
  background: "white",
};

const timeString = (): string => {
  const offset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - offset)
    .toISOString()
    .slice(0, -8)
    .replace(/\D/g, "-");
};

export default class Pages {
  pagesJSON: PageJSON[] = [defaultPageJSON];
  currentIndex = 0;

  constructor(
    public canvas: Page,
    public canvasWidth: number,
    public canvasHeight: number,
    public updateState: () => void
  ) {}

  savePage = (): void => {
    this.pagesJSON[this.currentIndex] = this.canvas.toObject([
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
    await this.canvas.loadFromJSONAsync(this.pagesJSON[index]);
    this.currentIndex = index;
    if (!fromFile || force) this.updateState();
    return index;
  };

  newPage = async (fromFile = false): Promise<number> => {
    this.pagesJSON.splice(this.currentIndex + 1, 0, defaultPageJSON);
    return this.loadPage(this.currentIndex + 1, fromFile);
  };

  previousPage = async (): Promise<number> => {
    if (this.currentIndex === 0) return 0;
    return this.loadPage(this.currentIndex - 1);
  };

  nextOrNewPage = async (fromFile = false): Promise<number> => {
    if (this.currentIndex === this.pagesJSON.length - 1) {
      return this.newPage(fromFile);
    }
    return this.loadPage(this.currentIndex + 1, fromFile);
  };

  export = async (): Promise<void> => {
    this.savePage();
    const ratio = 2;
    const content = [];
    const currentIndexCopy = this.currentIndex;
    for (const page of this.pagesJSON) {
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

    pdfMake.createPdf(docDefinition).download(`qboard-${timeString()}.pdf`);

    await this.canvas.loadFromJSONAsync(this.pagesJSON[currentIndexCopy]);
  };

  saveFile = (): void => {
    this.savePage();
    const [fileURL, revokeURL] = new JSONWriter(this.pagesJSON).toURL();

    const elt = document.createElement("a");
    elt.style.display = "none";
    elt.href = fileURL;
    elt.download = `qboard-${timeString()}.json`;
    document.body.appendChild(elt);
    elt.click();
    elt.parentElement.removeChild(elt);

    revokeURL();
    this.canvas.modified = false;
  };

  overwritePages = async (
    pages: PageJSON[] = [defaultPageJSON]
  ): Promise<boolean> => {
    const response =
      !this.canvas.modified ||
      this.pagesJSON.every((page) => page.objects.length === 0) ||
      window.confirm(
        "Your work will be overwritten. Are you sure you wish to continue?"
      );
    if (!response) return false;

    this.pagesJSON = pages;
    await this.loadPage(0, true, true);
    this.canvas.modified = false;
    return true;
  };

  insertPages = async (index: number, pages: PageJSON[]): Promise<number> => {
    this.pagesJSON.splice(index, 0, ...pages);
    this.canvas.modified = true;
    return this.loadPage(index);
  };
}
