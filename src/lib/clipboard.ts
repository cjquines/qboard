import { fabric } from "fabric";

import { Page } from "./pages";
import { HistoryHandler } from "./history";

export class ClipboardHandler {
  clipboard: fabric.Object;

  constructor(
    public canvas: Page,
    public history: HistoryHandler,
    public canvasWidth: number,
    public canvasHeight: number
  ) {}

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
    const { x, y } = this.canvas.cursor;

    this.clipboard.clone(async (clone) => {
      this.canvas.discardActiveObject();
      await this.canvas.getNextId().then((id) => {
        clone.set({
          id,
          left: x,
          top: y,
          originX: "center",
          originY: "center",
        });
      });
      if (clone._objects) {
        clone.canvas = this.canvas;
        await clone.forEachObject((object) => {
          this.canvas.getNextId().then((id) => {
            object.id = id;
            this.canvas.add(object);
          });
        });
        clone.setCoords();
      } else {
        this.canvas.add(clone);
      }
      this.canvas.setActiveObject(clone);
      await this.history.add(clone._objects || [clone]);
      this.canvas.requestRenderAll();
    });
  };
}
