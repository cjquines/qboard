import { fabric } from "fabric";

import { HistoryCommand } from "./history";
import Pages, { PageJSON } from "./pages";
import { Cursor } from "./page";

export class AsyncReader {
  static readAsText = (file: File): Promise<string | ArrayBuffer> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });

  static readAsDataURL = (file: File): Promise<string | ArrayBuffer> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
}

// manages version compatibility with old document formats
// change the signature and usages to accommodate new data; this will fill in sample data for missing fields
export class JSONReader {
  static async read(json: Promise<string | ArrayBuffer>): Promise<PageJSON[]> {
    const object = JSON.parse((await json).toString());

    const { "qboard-version": version, pages } = object;
    switch (version) {
      case 1:
      case 2:
        return pages;
      default:
        return pages;
    }
  }
}

export class JSONWriter {
  private readonly sourceJSON: {
    "qboard-version": number;
    pages: PageJSON[];
    "exported-date": Date;
  };
  private stringified: string;

  constructor(pagesJSON: PageJSON[]) {
    this.sourceJSON = {
      "qboard-version": 2,
      pages: pagesJSON,
      "exported-date": new Date(), // this date is only parsed once per new JSONWriter()
    };
  }

  toString = (): string => {
    if (this.stringified !== undefined) return this.stringified;
    this.stringified = JSON.stringify(this.sourceJSON);
    return this.stringified;
  };

  toBlob = (): Blob =>
    new Blob([this.toString()], { type: "application/json" });

  toURL = (): [string, () => void] => {
    const url = window.URL.createObjectURL(this.toBlob());
    const revoke = () => window.URL.revokeObjectURL(url);
    return [url, revoke];
  };
}

export class FileUI {
  static timeString = (): string => {
    const offset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - offset)
      .toISOString()
      .slice(0, -8)
      .replace(/\D/g, "-");
  };

  download = (name: string, fileURL: string, revokeURL = (): void => {}) => {
    const elt = document.createElement("a");
    elt.style.display = "none";
    elt.href = fileURL;
    elt.download = name;
    document.body.appendChild(elt);
    elt.click();
    elt.parentElement.removeChild(elt);

    revokeURL();
  };
}

export type FileHandlerResponse = {
  action: "none" | "image" | "json";
  history?: HistoryCommand;
};

export default class FileHandler {
  constructor(public pages: Pages) {}

  processFiles = async (
    files: FileList,
    cursor?: Cursor
  ): Promise<HistoryCommand> => {
    const images = [];
    await Promise.all(
      [...files].map(async (file) => {
        if (file.type.startsWith("image/")) {
          images.push(await this.handleImage(file, cursor));
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

  acceptFile = async (
    files: FileList,
    cursor?: Cursor
  ): Promise<FileHandlerResponse> => {
    if (!files.length) return { action: "none" };
    const [file] = files;

    if (file.type.startsWith("image/")) {
      return {
        action: "image",
        history: { add: await this.handleImage(file, cursor) },
      };
    }

    if (file.type === "application/json") {
      await this.openFile(file);
      return {
        action: "json",
        history: { clear: [true] },
      };
    }

    // unsupported file
    return { action: "none" };
  };

  openFile = async (file: File): Promise<boolean> => {
    this.pages.savePage();
    return this.pages.overwritePages(
      await JSONReader.read(AsyncReader.readAsText(file))
    );
  };

  private handleImage = async (
    file: File,
    cursor?: Cursor
  ): Promise<fabric.Object[]> =>
    new Promise<fabric.Object[]>((resolve) =>
      AsyncReader.readAsDataURL(file).then((result) =>
        fabric.Image.fromURL(result.toString(), (obj: fabric.Image) => {
          resolve(this.pages.canvas.placeObject(obj, cursor));
        })
      )
    );

  private handleJSON = async (file: File): Promise<number> => {
    const pages = await JSONReader.read(AsyncReader.readAsText(file));
    return this.pages.insertPages(this.pages.currentIndex + 1, pages);
  };
}
