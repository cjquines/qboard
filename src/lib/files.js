import { MalformedExpressionException } from "@mehra/ts";
const defaults = (value, getDefaultValue) => value === undefined ? getDefaultValue() : value;
export class AsyncReader {
}
AsyncReader.setup = (resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.onerror = reject;
    return reader;
};
AsyncReader.readAsText = (file) => new Promise((resolve, reject) => {
    AsyncReader.setup(resolve, reject).readAsText(file);
});
AsyncReader.readAsDataURL = (file) => new Promise((resolve, reject) => {
    AsyncReader.setup(resolve, reject).readAsDataURL(file);
});
const isJSONFile = (file) => file.type === "application/json";
const isImageFile = (file) => file.type.startsWith("image/");
/**
 * Basic check to test whether {@param object} is a valid qboard file at any version,
 * i.e. does it have type [[`QboardFile`]]?
 *
 * Not a deep check;
 * all valid qboard files will pass (return `true`) but not all invalid qboard files will fail (return `false`)
 */
const isValidQboardFile = (object) => {
    if (object instanceof Object) {
        return "qboard-version" in object;
    }
    return false;
};
/**
 * @Test Ensure that [[`CurrentQboardFile`]] is a subtype of [[`QboardFile`]]
 *
 * This means that every qboard file format (tested by strong induction) actually satisfies the contract we expect it to.
 */
{
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
    static read(json) {
        const object = JSON.parse(json.toString());
        return JSONReader.readParsed(object);
    }
    /**
     * Get the `pagesJSON` data from a parsed qboard file
     * @param object A parsed serialized qboard file
     * @throws {InvalidQboardFileException} if {@param object} doesn't represent a valid qboard file
     */
    static readParsed(object) {
        if (!isValidQboardFile(object))
            throw new InvalidQboardFileException();
        const { 
        // output is same regardless of version due to forwards compatibility
        // "qboard-version": version,
        pages, } = object;
        return pages;
    }
}
export class JSONWriter {
    constructor(pagesJSON) {
        this.toString = () => (this.asString = defaults(this.asString, () => JSON.stringify(this.sourceJSON)));
        this.toBlob = () => (this.asBlob = defaults(this.asBlob, () => new Blob([this.toString()], { type: "application/json" })));
        this.toURL = () => {
            this.asUrl = defaults(this.asUrl, () => window.URL.createObjectURL(this.toBlob()));
            const revoke = () => {
                if (this.asUrl === undefined)
                    return;
                window.URL.revokeObjectURL(this.asUrl);
                this.asUrl = undefined;
            };
            return [this.asUrl, revoke];
        };
        this.download = (filename = "qboard-file") => {
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
        this.sourceJSON = {
            "qboard-version": 2,
            pages: pagesJSON,
        };
    }
}
export default class FileHandler {
    constructor(pages, history) {
        this.pages = pages;
        this.history = history;
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
        this.processFiles = async (files, cursor) => {
            const additions = [];
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
            this.history.add(additions);
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
        this.acceptFile = async (files, cursor) => {
            if (!files.length)
                return "none";
            const [file] = files;
            if (isImageFile(file)) {
                this.history.add([await this.handleImage(file, cursor)]);
                return "image";
            }
            if (isJSONFile(file)) {
                await this.openFile(file);
                this.history.clear(true);
                return "json";
            }
            // unsupported file
            return "none";
        };
        this.openFile = async (file) => {
            this.pages.savePage();
            return this.pages.overwritePages(JSONReader.read(await AsyncReader.readAsText(file)));
        };
        this.handleImage = async (file, cursor) => AsyncReader.readAsDataURL(file)
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
                img.scaleToWidth(Math.min(maxWidth * w_c, (maxHeight * h_c * w_i) / h_i));
            return img;
        });
        this.handleJSON = async (file) => {
            const pages = JSONReader.read(await AsyncReader.readAsText(file));
            return this.pages.insertPagesAfter(pages);
        };
    }
}
