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
  currentIndex = 0;

  constructor(
    public canvas: Page,
    public canvasWidth: number,
    public canvasHeight: number,
    public updateState: () => void,
    public pagesJSON: PageJSON[] = [defaultPageJSON]
  ) {}

  savePage = (): void => {
    this.pagesJSON[this.currentIndex] = this.canvas.toObject([
      "id",
      "strokeUniform",
    ]);
  };

  // TODO: Should saveExisting be renamed and negated to force?
  loadPage = async (index: number, saveExisting = true): Promise<number> => {
    if (saveExisting) this.savePage();
    if (index === this.currentIndex && saveExisting) return index;
    await this.canvas.loadFromJSONAsync(this.pagesJSON[index]);
    this.currentIndex = index;
    this.updateState();
    return index;
  };

  previousOrNewPage = async (): Promise<number> => {
    if (this.currentIndex === 0) {
      return this.insertPagesBefore([defaultPageJSON]);
    }
    return this.loadPage(this.currentIndex - 1);
  };

  nextOrNewPage = async (): Promise<number> => {
    if (this.currentIndex === this.pagesJSON.length - 1) {
      return this.insertPagesAfter([defaultPageJSON]);
    }
    return this.loadPage(this.currentIndex + 1);
  };

  export = async (): Promise<void> => {
    this.savePage();
    const ratio = 2;
    const content: { svg: string; width: number }[] = [];
    const currentIndexCopy = this.currentIndex;
    // Load each page and then record it as svg
    for (const page of this.pagesJSON) {
      // As of now, each page needs to be individually loaded, so we await each load
      // eslint-disable-next-line no-await-in-loop
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
    new JSONWriter(this.pagesJSON).download(`qboard-${timeString()}.json`);
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
    await this.loadPage(0, false);
    this.canvas.modified = false;
    return true;
  };

  insertPagesBefore = async (
    pages: PageJSON[],
    isNonModifying = false
  ): Promise<number> => {
    this.pagesJSON.splice(this.currentIndex, 0, ...pages);
    // make sure not to do
    // this.canvas.modified = !isNonModifying
    // because that marks an already modified board as unmodified
    if (!isNonModifying) {
      this.canvas.modified = true;
    }
    return this.loadPage(this.currentIndex, false);
  };

  insertPagesAfter = async (
    pages: PageJSON[],
    isNonModifying = false
  ): Promise<number> => {
    this.pagesJSON.splice(this.currentIndex + 1, 0, ...pages);
    // make sure not to do
    // this.canvas.modified = !isNonModifying
    // because that marks an already modified board as unmodified
    if (!isNonModifying) {
      this.canvas.modified = true;
    }
    return this.loadPage(this.currentIndex + 1, true);
  };
}
