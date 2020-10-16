import { fabric } from "fabric";

import { HistoryCommand } from "./history";
import Pages from "./pages";

export class AsyncReader extends Promise<FileReader> {
  constructor(file: File) {
    if (file instanceof File)
      super((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    else super(file);
  }
}

// manages version compatibility with old document formats
// change the signature and usages to accommodate new data; this will fill in sample data for missing fields
export class JSONReader {
  static async read(reader: AsyncReader): Promise<any[]> {
    const json = (await reader).result.toString();
    const object = JSON.parse(json);

    // V0
    if (Array.isArray(object)) return object;

    const { version, data } = object;
    switch (version) {
      case 1:
        return data;
      default:
        return data;
    }
  }
}

export class JSONWriter {
  private readonly sourceJSON: {
    version: number;
    pages: any[];
  };
  private stringified: string;

  constructor(pagesJSON: any[]) {
    this.sourceJSON = {
      version: 1,
      pages: pagesJSON,
    };
  }

  toString = (): string => {
    if (this.stringified) return this.stringified;
    this.stringified = JSON.stringify(this.sourceJSON);
    return this.stringified;
  };

  toBlob = (): Blob =>
    new Blob([this.toString()], { type: "application/json" });

  toURL = (): [url: string, revoke: () => void] => {
    const url = window.URL.createObjectURL(this.toBlob());
    const revoke = () => window.URL.revokeObjectURL(url);
    return [url, revoke];
  };
}

export type FileHandlerResponse = {
  action: "none" | "image" | "json";
  history?: HistoryCommand;
};

export default class FileHandler {
  constructor(public pages: Pages) {}

  processFiles = async (files: FileList, cursor?): Promise<HistoryCommand> => {
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
    cursor?
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
  };

  openFile = async (file: File): Promise<boolean> => {
    this.pages.savePage();
    return this.pages.overwritePages(
      await JSONReader.read(new AsyncReader(file))
    );
  };

  private handleImage = async (file: File, cursor): Promise<fabric.Object[]> =>
    new Promise<fabric.Object[]>((resolve) => {
      const fileURL = window.URL.createObjectURL(file);
      fabric.Image.fromURL(fileURL, (obj: fabric.Image) => {
        resolve(this.pages.canvas.placeObject(obj, cursor));
      });
    });

  private handleJSON = async (file: File): Promise<number> => {
    const pages = await JSONReader.read(new AsyncReader(file));
    return this.pages.insertPages(this.pages.currentIndex + 1, pages);
  };
}
