import { fabric } from "fabric";

import { Page } from "./pages";
import { HistoryHandler } from "./history";
import { Image } from "fabric/fabric-impl";

export class ClipboardHandler {
  clipboard: fabric.Object;

  constructor(
    public canvas: Page,
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
    this.clipboard.clone(async (clone) => {
      await this.placeObject(clone);
    });
  };

  pasteExternal = async (e: ClipboardEvent): Promise<void> => {
    await this.processFiles(e.clipboardData.files);
    await this.paste();
  };

  processFiles = async (files: FileList): Promise<void[]> => {
    const promises = [...files]
      .filter(({ type }) => type.includes("image"))
      .map(
        (file) =>
          new Promise<void>((resolve) => {
            const url = window.URL.createObjectURL(file);
            fabric.Image.fromURL(url, (obj: Image) => {
              resolve(this.placeObject(obj));
            });
          })
      );
    return Promise.all(promises);
  };

  placeObject = async (obj: any): Promise<void> => {
    const { x = this.canvasWidth / 2, y = this.canvasHeight / 2 } =
      this.canvas.cursor || {};
    this.canvas.discardActiveObject();
    const id = await this.canvas.getNextId();

    obj.set({
      id,
      left: x,
      top: y,
      originX: "center",
      originY: "center",
    });
    if (obj._objects) {
      obj.canvas = this.canvas;
      obj.forEachObject((object) => {
        this.canvas.getNextId().then((id) => {
          object.id = id;
          this.canvas.add(object);
        });
      });
      obj.setCoords();
    } else {
      this.canvas.add(obj);
    }
    this.canvas.setActiveObject(obj);
    await this.history.add(obj._objects || [obj]);
    this.canvas.requestRenderAll();
  };
}
