import { fabric } from "fabric";
import { MalformedExpressionException, RequireSubType } from "@mehra/ts";

import { HistoryCommand } from "./history";
import Pages, { PageJSON } from "./pages";
import { Cursor } from "./page";

const defaults = <T>(value: T | undefined, getDefaultValue: () => T) =>
  value === undefined ? getDefaultValue() : value;

export class AsyncReader {
  static readAsText = (file: File): Promise<string | ArrayBuffer> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result!);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });

  static readAsDataURL = (file: File): Promise<string | ArrayBuffer> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result!);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
}

type JSONFile = File & { type: "application/json" };
type ImageFile = File & { type: `image/${string}` };

const isJSONFile = (file: File): file is JSONFile =>
  file.type === "application/json";

const isImageFile = (file: File): file is ImageFile =>
  file.type.startsWith("image/");

/**
 * Common to _all_ versions of exports
 */
interface QboardFile {
  // It is objective truth that every past and future qboard file will be an object containing this field
  "qboard-version": number;

  // If a future version removes this field, this is actually okay;
  // just remove the field from this interface declaration.
  // The reason for this field existing right now is that we _know_ that every qboard file has it,
  // so we include it for convenience.
  // However, it's not necessarily true that this field will remain the same forever.
  pages: PageJSON[];
}

/**
 * Basic check to test whether {@param object} is a valid qboard file at any version,
 * i.e. does it have type [[`QboardFile`]]?
 *
 * Not a deep check;
 * all valid qboard files will pass (return `true`) but not all invalid qboard files will fail (return `false`)
 */
const isValidQboardFile = (object: unknown): object is QboardFile => {
  if (object instanceof Object) {
    return "qboard-version" in object;
  }
  return false;
};

/**
 * The current qboard file format
 */
interface CurrentQboardFile {
  "qboard-version": 1;
  pages: PageJSON[];
}

/**
 * @Test Ensure that [[`CurrentQboardFile`]] is a subtype of [[`QboardFile`]]
 *
 * This means that every qboard file format (tested by strong induction) actually satisfies the contract we expect it to.
 */
{
  // We need to write our own test because ts doesn't let an interface implement another interface

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type T = RequireSubType<CurrentQboardFile, QboardFile>;
}

/**
 * A file, supposedly serialized from qboard, doesn't adhere to any version of the qboard file spec
 */
export class InvalidQboardFileException extends MalformedExpressionException {
  constructor(message = "Invalid qboard file") {
    super(message);
  }
}

// manages version compatibility with old document formats
// change the signature and usages to accommodate new data; this will fill in sample data for missing fields
export class JSONReader {
  /**
   * Get the `pagesJSON` data from a qboard file
   * @param json A JSON-serialized qboard file
   * @throws {InvalidQboardFileException} if {@param json} doesn't represent a valid qboard file
   */
  static read(json: string | ArrayBuffer): PageJSON[] {
    const object = JSON.parse(json.toString());
    return JSONReader.readParsed(object);
  }

  /**
   * Get the `pagesJSON` data from a parsed qboard file
   * @param object A parsed serialized qboard file
   * @throws {InvalidQboardFileException} if {@param object} doesn't represent a valid qboard file
   */
  static readParsed(object: unknown): PageJSON[] {
    if (!isValidQboardFile(object)) throw new InvalidQboardFileException();

    const {
      // output is same regardless of version due to forwards compatibility
      // "qboard-version": version,
      pages,
    } = object;
    return pages;
  }
}

export class JSONWriter {
  private readonly sourceJSON: CurrentQboardFile;
  private asString?: string;
  private asBlob?: Blob;
  private asUrl?: string;

  constructor(pagesJSON: PageJSON[]) {
    this.sourceJSON = {
      "qboard-version": 1,
      pages: pagesJSON,
    };
  }

  toString = (): string =>
    (this.asString = defaults(this.asString, () =>
      JSON.stringify(this.sourceJSON)
    ));

  toBlob = (): Blob =>
    (this.asBlob = defaults(
      this.asBlob,
      () => new Blob([this.toString()], { type: "application/json" })
    ));

  toURL = (): [string, () => void] => {
    this.asUrl = defaults(this.asUrl, () =>
      window.URL.createObjectURL(this.toBlob())
    );
    const revoke = () => {
      if (this.asUrl === undefined) return;

      window.URL.revokeObjectURL(this.asUrl);
      this.asUrl = undefined;
    };
    return [this.asUrl, revoke];
  };

  download = (filename = "qboard-file"): void => {
    const [fileURL, revokeURL] = this.toURL();

    const elt = document.createElement("a");
    elt.style.display = "none";
    elt.href = fileURL;
    elt.download = filename;
    document.body.appendChild(elt);
    elt.click();
    elt.remove();

    revokeURL();
  };
}

export type FileHandlerResponse = {
  action: "none" | "image" | "json";
  history?: HistoryCommand;
};

export default class FileHandler {
  constructor(public pages: Pages) {}

  /**
   * Accepts multiple files, usually via file drop, and performs the equivalent of adding them to qboard in order.
   *  * Image files are added to the *active page*, at the location of {@param cursor} if it is provided.
   *  * JSON files representing qboard files have their pages inserted into the page list *after the current page*,
   *    and then the first page of the inserted file (=current page + 1) is activated.
   *
   * Implementation detail: currently *does* add each in order;
   * this could likely be optimized.
   * If so, be careful to validate the json files so that the behavior is equivalent to doing each individually.
   * @param files The ordered list of files
   */
  processFiles = async (
    files: FileList,
    cursor?: Cursor
  ): Promise<HistoryCommand> => {
    const additions: HistoryCommand["add"] = [];

    for (const file of files) {
      if (isImageFile(file)) {
        // eslint-disable-next-line no-await-in-loop
        additions.push(await this.handleImage(file, cursor));
      }

      if (isJSONFile(file)) {
        // eslint-disable-next-line no-await-in-loop
        await this.handleJSON(file);
      }
    }

    return { add: additions };
  };

  /**
   * Accepts a single file, the first element of {@param files},
   * usually from file upload through input element, and adds it to the qboard file.
   *  * Image files are added to the *active page*, at the location of {@param cursor} if it is provided.
   *  * JSON files representing qboard files completely overwrite the board and history,
   *    and the first page of the added file (= 1) is loaded.
   *
   * @warn
   * Gives you the history commands you must apply, but you must do it yourself.
   * This function does not actually modify history.
   */
  acceptFile = async (
    files: FileList,
    cursor?: Cursor
  ): Promise<FileHandlerResponse> => {
    if (!files.length) return { action: "none" };
    const [file] = files;

    if (isImageFile(file)) {
      return {
        action: "image",
        history: { add: [await this.handleImage(file, cursor)] },
      };
    }

    if (isJSONFile(file)) {
      await this.openFile(file);
      return {
        action: "json",
        history: { clear: [true] },
      };
    }

    // unsupported file
    return { action: "none" };
  };

  openFile = async (file: JSONFile): Promise<boolean> => {
    this.pages.savePage();
    return this.pages.overwritePages(
      JSONReader.read(await AsyncReader.readAsText(file))
    );
  };

  private handleImage = async (
    file: ImageFile,
    cursor?: Cursor
  ): Promise<fabric.Object> =>
    AsyncReader.readAsDataURL(file)
      .then((result) => this.pages.canvas.addImage(result.toString(), cursor))
      .then((img) => {
        const maxWidth = 0.8;
        const maxHeight = 0.8;

        const [w_i = 0, w_c = 0, h_i = 0, h_c = 0] = [
          img.width,
          this.pages.canvas.width,
          img.height,
          this.pages.canvas.height,
        ];

        if (w_i > maxWidth * w_c || h_i > maxHeight * h_c)
          img.scaleToWidth(
            Math.min(maxWidth * w_c, (maxHeight * h_c * w_i) / h_i)
          );

        return img;
      });

  private handleJSON = async (file: JSONFile): Promise<number> => {
    const pages = JSONReader.read(await AsyncReader.readAsText(file));
    return this.pages.insertPagesAfter(pages);
  };
}
