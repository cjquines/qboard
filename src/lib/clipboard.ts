import { fabric } from "fabric";

import { FabricObject, isFabricCollection } from "../types/fabric";
import AssertType from "../types/assert";

import Page from "./page";
import Pages from "./pages";
import FileHandler from "./files";
import HistoryHandler from "./history";

export default class ClipboardHandler {
  clipboard?: FabricObject;

  constructor(
    public canvas: Page,
    public pages: Pages,
    public files: FileHandler,
    public history: HistoryHandler,
    public canvasWidth: number,
    public canvasHeight: number
  ) {
    document.addEventListener("paste", this.pasteExternal);
  }

  copy = (): fabric.Object | null => {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return null;

    // Add missing type information
    AssertType<FabricObject>(activeObject);

    activeObject.clone((clone) => {
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

    this.canvas.discardActiveObject();
    if (isFabricCollection(activeObject)) {
      activeObject.forEachObject((object) => {
        this.canvas.remove(object);
      });
      this.history.remove(activeObject.getObjects());
    } else {
      this.canvas.remove(activeObject);
      this.history.remove([activeObject]);
    }
    this.canvas.requestRenderAll();

    return true;
  };

  paste = (): void => {
    if (this.clipboard === undefined) return;

    return this.clipboard.clone((clone) =>
      this.history.add(this.canvas.placeObject(clone))
    );
  };

  pasteExternal = async (e: ClipboardEvent): Promise<void> => {
    const historyCommand = await this.files.processFiles(
      e.clipboardData!.files
    );
    this.history.execute(historyCommand);
  };
}
