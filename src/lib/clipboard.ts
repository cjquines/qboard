import { fabric } from "fabric";

import Page from "./page";
import Pages from "./pages";
import HistoryHandler from "./history";

export class ClipboardHandler {
  clipboard: fabric.Object;

  constructor(
    public canvas: Page,
    public pages: Pages,
    public history: HistoryHandler,
    public canvasWidth: number,
    public canvasHeight: number
  ) {
    window.addEventListener("paste", this.pasteExternal);
  }

  copy = async (): Promise<any> => {
    const objects = this.canvas.getActiveObject();
    if (!objects) return null;
    objects.clone((clone) => {
      this.clipboard = clone;
    });
    return objects;
  };

  cut = async (): Promise<boolean> => {
    const objects = await this.copy();
    if (!objects) return false;
    this.canvas.discardActiveObject();
    if (objects.type === "activeSelection") {
      objects.forEachObject((object) => {
        this.canvas.remove(object);
      });
      await this.history.remove(objects._objects);
    } else {
      this.canvas.remove(objects);
      await this.history.remove([objects]);
    }
    this.canvas.requestRenderAll();
    return true;
  };

  paste = async (): Promise<void> => {
    if (!this.clipboard) return;
    return this.clipboard.clone((clone) =>
      this.canvas.placeObject(clone).then(this.history.add)
    );
  };

  pasteExternal = async (e: ClipboardEvent): Promise<void> => {
    const imgs = await this.pages.processFiles(e.clipboardData.files, null);
    await this.history.add(imgs);
    await this.paste();
  };
}
