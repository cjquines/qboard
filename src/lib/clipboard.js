import { isFabricCollection } from "../types/fabric";
import AssertType from "../types/assert";
export default class ClipboardHandler {
    constructor(canvas, pages, files, history, canvasWidth, canvasHeight) {
        this.canvas = canvas;
        this.pages = pages;
        this.files = files;
        this.history = history;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.copy = () => {
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject)
                return null;
            // Add missing type information
            AssertType(activeObject);
            activeObject.clone((clone) => {
                this.clipboard = clone;
            });
            return activeObject;
        };
        /**
         * Cuts currently selected objects, if any
         * @return Whether there were objects to cut
         */
        this.cut = () => {
            const activeObject = this.copy();
            if (!activeObject)
                return false;
            this.canvas.discardActiveObject();
            if (isFabricCollection(activeObject)) {
                activeObject.forEachObject((object) => {
                    this.canvas.remove(object);
                });
                this.history.remove(activeObject.getObjects());
            }
            else {
                this.canvas.remove(activeObject);
                this.history.remove([activeObject]);
            }
            this.canvas.requestRenderAll();
            return true;
        };
        this.paste = () => {
            if (this.clipboard === undefined)
                return;
            return this.clipboard.clone((clone) => this.history.add(this.canvas.placeObject(clone)));
        };
        this.pasteExternal = async (e) => {
            await this.files.processFiles(e.clipboardData.files);
        };
        document.addEventListener("paste", this.pasteExternal);
    }
}
