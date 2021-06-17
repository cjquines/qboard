import pdfMake from "pdfmake/build/pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
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

/**
 * @return The current local time in the form `YYYY-MM-DD-HH-mm`
 */
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
      "data",
      "strokeUniform",
    ]);
  };

  /**
   * Safe method to load "move to"/"switch to" a specific page in UI.
   * Will not do anything if `{@param index} === this.currentIndex && {@param saveExisting}`.
   *
   * @param index The 0-based index of the page to load
   * @param saveExisting
   * Whether to save the contents on the current page to memory before switching pages.
   * Forces an unconditional re-render when set to `false`,
   * as opposed to not doing anything if the current page is {@param index}.
   * May need to set to `false` if directly manipulating the internal array to prevent an override.
   * @return
   * The index of the loaded page.
   * This equals {@param index}.
   */
  // TODO: Should saveExisting be renamed and negated to force?
  loadPage = async (index: number, saveExisting = true): Promise<number> => {
    if (saveExisting) this.savePage();
    if (index === this.currentIndex && saveExisting) return index;
    await this.canvas.loadFromJSONAsync(this.pagesJSON[index]);
    this.currentIndex = index;
    this.updateState();
    return index;
  };

  /**
   * Safely move back one page, creating a blank page if necessary.
   * @return The index of the loaded page.
   */
  previousOrNewPage = (): Promise<number> => {
    if (this.currentIndex === 0) {
      return this.insertPagesBefore([defaultPageJSON], true);
    }
    return this.loadPage(this.currentIndex - 1);
  };

  /**
   * Safely move forward one page, creating a blank page if necessary.
   * @return The index of the loaded page.
   */
  nextOrNewPage = (): Promise<number> => {
    if (this.currentIndex === this.pagesJSON.length - 1) {
      return this.insertPagesAfter([defaultPageJSON], true);
    }
    return this.loadPage(this.currentIndex + 1);
  };

  /**
   * Safely convert the existing pages to PDF, and initiate a download.
   * The filename is of the form `qboard-YYYY-MM-DD-HH-mm.pdf` in local time.
   */
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

    const docDefinition: TDocumentDefinitions = {
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

  /**
   * Safely convert the existing pages to qboard JSON, and initiate a download.
   * The filename is of the form `qboard-YYYY-MM-DD-HH-mm.json` in local time.
   */
  saveFile = (): void => {
    this.savePage();
    new JSONWriter(this.pagesJSON).download(`qboard-${timeString()}.json`);
    this.canvas.modified = false;
  };

  /**
   * Replace the entire board with different data,
   * after prompting (window.confirm) the user for confirmation.
   * @param pages an array of page data in the internal format
   * @return Whether the pages were successfully overwritten.
   * This is the same as whether the user accepted the prompt.
   */
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

  /**
   * Add the content of {@param pages} to the pages list before the current page.
   * @param isNonModifying `true` if you don't want to mark the board as modified due to this change.
   * Generally set when inserting blank pages, which don't contain any objects.
   */
  insertPagesBefore = async (
    pages: PageJSON[] = [defaultPageJSON],
    isNonModifying = false
  ): Promise<number> => {
    this.savePage();
    this.pagesJSON.splice(this.currentIndex, 0, ...pages);
    // make sure not to do
    // this.canvas.modified = !isNonModifying
    // because that marks an already modified board as unmodified
    if (!isNonModifying) {
      this.canvas.modified = true;
    }
    // you have already saved the pages via splice;
    // if you saveExisting then you will be saving to the wrong index
    return this.loadPage(this.currentIndex, false);
  };

  /**
   * Add the content of {@param pages} to the pages list after the current page.
   * @param isNonModifying `true` if you don't want to mark the board as modified due to this change.
   * Generally set when inserting blank pages, which don't contain any objects.
   */
  insertPagesAfter = async (
    pages: PageJSON[] = [defaultPageJSON],
    isNonModifying = false
  ): Promise<number> => {
    this.pagesJSON.splice(this.currentIndex + 1, 0, ...pages);
    // make sure not to do
    // this.canvas.modified = !isNonModifying
    // because that marks an already modified board as unmodified
    if (!isNonModifying) {
      this.canvas.modified = true;
    }
    // you can saveExisting because you're only updating indices _after_ the current page.
    // you can also saveExisting before the splice
    return this.loadPage(this.currentIndex + 1, true);
  };
}
