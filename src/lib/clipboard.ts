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

  cut = async (): Promise<boolean> => {
    const objects = (await this.copy()) as fabric.ActiveSelection;
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

  paste = (): void => {
    if (!this.clipboard) return;
    return this.clipboard.clone((clone) =>
      this.canvas.placeObject(clone).then(this.history.add)
    );
  };

  pasteExternal = async (e: ClipboardEvent): Promise<void> => {
    const historyCommand = await this.files.processFiles(e.clipboardData.files);
    await this.history.execute(historyCommand);
    await this.paste();
  };
}
