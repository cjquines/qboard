import { fabric } from "fabric";

import { Page } from "./pages";
import { HistoryHandler } from "./history";

export class ClipboardHandler {
  clipboard: any[] = [];

  constructor(
    public canvas: Page,
    public history: HistoryHandler,
    public canvasWidth: number,
    public canvasHeight: number
  ) {}

  copy = async (): Promise<fabric.Object[] | null> => {
    const objects = this.canvas.getActiveObjects();
    if (!objects.length) return null;
    this.clipboard = objects.map((object) => fabric.util.object.clone(object));
    return objects;
  };

  cut = async (): Promise<boolean> => {
    const objects = await this.copy();
    if (!objects) return false;
    this.canvas.discardActiveObject();
    this.canvas.remove(...objects);
    this.canvas.renderAll();
    this.history.remove(objects);
    return true;
  };

  paste = async (): Promise<void> => {
    if (!this.clipboard.length) return;
    const { latestCursorX: x, latestCursorY: y } = this.canvas;
    let objects: fabric.Object[] = [];

    // stupid relative coordinates
    if (this.clipboard.length === 1) {
      const clone = fabric.util.object.clone(this.clipboard[0]);
      clone.id = this.canvas.getNextId();
      clone.left = x - clone.width / 2;
      clone.top = y - clone.height / 2;
      objects = [clone];
    } else {
      objects = this.clipboard.map((object) => {
        const clone = fabric.util.object.clone(object);
        clone.id = this.canvas.getNextId();
        clone.left = clone.left + x;
        clone.top = clone.top + y;
        return clone;
      });
    }

    await this.canvas.add(...objects);
    this.canvas.setActiveObject(
      new fabric.ActiveSelection(objects, { canvas: this.canvas })
    );
    this.canvas.renderAll();
    this.history.add(objects);
  };
}
