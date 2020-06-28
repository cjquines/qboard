import { fabric } from "fabric";

import { Page } from "./pages";

interface HistoryItem {
  ids: number[];
  oldObjects: fabric.Object[] | null;
  newObjects: fabric.Object[] | null;
}

export class HistoryHandler {
  history: HistoryItem[] = [];
  redoStack: HistoryItem[] = [];
  locked: boolean = false;

  constructor(public canvas: Page) {}

  add = async (objects: any[]): Promise<void> => {
    if (this.locked) return;
    this.save({
      ids: objects.map((object) => object.id),
      oldObjects: null,
      newObjects: objects,
    });
  };

  remove = async (objects: any[]): Promise<void> => {
    if (this.locked) return;
    this.save({
      ids: objects.map((object) => object.id),
      oldObjects: objects,
      newObjects: null,
    });
  };

  save = async (item: HistoryItem): Promise<void> => {
    if (this.locked) return;
    this.history.push(item);
    this.redoStack = [];
  };

  undo = async (): Promise<void> => {
    if (!this.history.length) return;
    const last = this.history.pop();
    this.redoStack.push(last);
    this.locked = true;
    await this.canvas.apply(last.ids, last.oldObjects);
    this.locked = false;
  };

  redo = async (): Promise<void> => {
    if (!this.redoStack.length) return;
    const last = this.redoStack.pop();
    this.history.push(last);
    this.locked = true;
    await this.canvas.apply(last.ids, last.newObjects);
    this.locked = false;
  };
}
