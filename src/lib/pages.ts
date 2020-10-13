import pdfMake from "pdfmake/build/pdfmake.min";

import Page from "./page";
import AsyncReader from "./asyncReader";
import { fabric } from "fabric";

const defaultPageJSON = {
  version: "3.6.3",
  objects: [],
  background: "white",
};

export default class Pages {
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
    fromFile: boolean = false,
    force: boolean = false
  ): Promise<number> => {
    if (index === this.currentIndex && !force) return index;
    if (!fromFile) this.savePage();
    await this.canvas.loadFromJSONAsync(this.pagesJson[index]);
    this.currentIndex = index;
    if (!fromFile || force) this.updateState();
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
    // ends up stringifying a parameter that we generated with json.parse
    const response =
      !this.canvas.modified ||
      JSON.stringify(this.pagesJson) === JSON.stringify(pages) ||
      window.confirm(
        "You have unsaved work. Are you sure you wish to continue?"
      );
    if (response !== true) return false;

    this.pagesJson = pages;
    await this.loadPage(0, true, true);
    this.canvas.modified = true;
    return true;
  };

  insertPages = async (
    index: number = this.currentIndex + 1,
    pages: any[] = []
  ) => {
    this.pagesJson.splice(index, 0, ...pages);
    return this.loadPage(index);
  };

  openFile = async (files: FileList): Promise<boolean> => {
    if (!files.length) return;
    const file = files[0];

    this.savePage();
    const asyncReader = AsyncReader(file);

    return this.overwritePages(
      JSON.parse((await asyncReader).result.toString())
    );
  };

  private handleImage = async (file, cursor): Promise<any> =>
    new Promise<any>((resolve) => {
      const fileURL = window.URL.createObjectURL(file);
      fabric.Image.fromURL(fileURL, (obj: fabric.Image) => {
        resolve(this.canvas.placeObject(obj, cursor));
      });
    });

  private handleJSON = async (file): Promise<number> => {
    const asyncReader = AsyncReader(file);
    return this.insertPages(
      undefined,
      JSON.parse((await asyncReader).result.toString())
    );
  };

  processFiles = async (files: FileList, cursor?): Promise<any[]> => {
    const images = [...files]
      .filter(({ type }) => type.startsWith("image/"))
      .map((file) => this.handleImage(file, cursor));
    const json = [...files]
      .filter(({ type }) => type === "application/json")
      .map(this.handleJSON);
    await Promise.all([...images, ...json]);
    return Promise.all(images);
  };
}
