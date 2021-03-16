import { fabric } from "fabric";

import Page from "./page";
import Pages from "./pages";
import FileHandler from "./files";
import HistoryHandler from "./history";

export default class ClipboardHandler {
  clipboard: fabric.Object;

  constructor(
    public canvas: Page,
    public pages: Pages,
    public files: FileHandler,
    public history: HistoryHandler,
    public canvasWidth: number,
    public canvasHeight: number
  ) {
    window.addEventListener("paste", this.pasteExternal);
  }

  copy = (): fabric.Object => {
    const objects: fabric.Object = this.canvas.getActiveObject();
    if (!objects) return null;
    objects.clone((clone) => {
      this.clipboard = clone;
    });
    return objects;
  };

  /**
   * Cuts currently selected objects, if any
   * @return Whether there were objects to cut
   */
  cut = (): boolean => {
    const objects = this.copy() as fabric.ActiveSelection;
    if (!objects) return false;

    this.canvas.discardActiveObject();
    if (objects.type === "activeSelection") {
      objects.forEachObject((object) => {
        this.canvas.remove(object);
      });
      this.history.remove(objects._objects);
    } else {
      this.canvas.remove(objects);
      this.history.remove([objects]);
    }
    this.canvas.requestRenderAll();

    return true;
  };

  paste = (): void => {
    if (!this.clipboard) return;
    return this.clipboard.clone((clone) =>
      this.history.add(this.canvas.placeObject(clone))
    );
  };

  pasteExternal = async (e: ClipboardEvent): Promise<void> => {
    const historyCommand = await this.files.processFiles(e.clipboardData.files);
    this.history.execute(historyCommand);
    this.paste();
  };
}
