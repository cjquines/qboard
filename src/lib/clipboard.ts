import * as fabric from "fabric";

import { isFabricCollection } from "../types/fabric";
import AssertType from "../types/assert";

import Page from "./page";
import Pages from "./pages";
import FileHandler from "./files";
import HistoryHandler from "./history";

export default class ClipboardHandler {
  clipboard?: fabric.FabricObject;

  constructor(
    public canvas: Page,
    public pages: Pages,
    public files: FileHandler,
    public history: HistoryHandler,
    public canvasWidth: number,
    public canvasHeight: number,
  ) {
    document.addEventListener("paste", this.pasteExternal);
  }

  copy = (): fabric.FabricObject | null => {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return null;

    // Add missing type information
    AssertType<fabric.FabricObject>(activeObject);

    activeObject.clone().then((clone) => {
      this.clipboard = clone;
    });
    return activeObject;
  };

  /**
   * Cuts currently selected objects, if any
   * @return Whether there were objects to cut
   */
  cut = (): boolean => {
    const activeObject = this.copy();
    if (!activeObject) return false;

    if (isFabricCollection(activeObject)) {
      activeObject.forEachObject((object) => {
        this.canvas.remove(object);
      });
      this.history.remove(activeObject.getObjects());
    } else {
      this.canvas.remove(activeObject);
      this.history.remove([activeObject]);
    }
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();

    return true;
  };

  paste = (): void => {
    if (this.clipboard === undefined) return;

    this.clipboard
      .clone()
      .then((clone) => this.history.add(this.canvas.placeObject(clone)));
  };

  pasteExternal = async (e: ClipboardEvent): Promise<void> => {
    await this.files.processFiles(e.clipboardData!.files);
  };
}
