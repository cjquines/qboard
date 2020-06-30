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
    objects.clone((clone) => {this.clipboard = clone});
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
      this.history.remove(objects._objects);
    } else {
      this.canvas.remove(objects);
      this.history.remove([objects]);
    }
    this.canvas.renderAll();
    return true;
  };

  paste = async (): Promise<void> => {
    if (!this.clipboard) return;
    const { latestCursorX: x, latestCursorY: y } = this.canvas;

    this.clipboard.clone((clone) => {
      this.canvas.discardActiveObject();
      clone.set({
        id: this.canvas.getNextId(),
        left: x,
        top: y,
        originX: "center",
        originY: "center",
        strokeUniform: true,
      });
      if (clone.type === "activeSelection") {
        clone.canvas = this.canvas;
        clone.forEachObject((object) => {
          object.id = this.canvas.getNextId();
          object.strokeUniform = true;
          this.canvas.add(object);
        })
        clone.setCoords();
        this.history.add(clone._objects);
      } else {
        this.canvas.add(clone);
        this.history.add([clone]);
      }
      this.canvas.setActiveObject(clone);
      this.canvas.requestRenderAll();
    })
  };
}
