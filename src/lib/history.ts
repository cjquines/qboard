import { fabric } from "fabric";

import { Page, Pages } from "./pages";

interface HistoryItem {
  ids: number[];
  oldObjects: fabric.Object[] | null;
  newObjects: fabric.Object[] | null;
  page: number;
}

export class HistoryHandler {
  history: HistoryItem[] = [];
  redoStack: HistoryItem[] = [];
  selection: fabric.Object[];
  locked: boolean = false;

  constructor(
    public canvas: Page,
    public pages: Pages,
    public updateState: () => void
  ) {}

  add = async (objects: any[]): Promise<void> => {
    this.save(null, objects);
  };

  remove = async (objects: any[]): Promise<void> => {
    this.save(objects, null);
  };

  store = async (objects: any[]): Promise<void> => {
    if (this.locked) return;
    const ids = objects.map((object) => object.id);
    this.selection = await this.canvas.serialize(objects);
  };

  modify = async (objects: any[]): Promise<void> => {
    this.save(this.selection, objects);
  };

  save = async (
    oldObjects: any[] | null,
    newObjects: any[] | null
  ): Promise<void> => {
    if (this.locked) return;
    const basis = newObjects || oldObjects;
    this.history.push({
      ids: basis.map((object) => object.id),
      oldObjects: newObjects
        ? oldObjects
        : await this.canvas.serialize(oldObjects),
      newObjects: newObjects && (await this.canvas.serialize(newObjects)),
      page: this.pages.currentIndex,
    });
    this.redoStack = [];
    this.updateState();
  };

  undo = async (): Promise<void> => {
    if (!this.history.length) return;
    this.canvas.discardActiveObject();
    const last = this.history.pop();
    this.redoStack.push(last);
    this.locked = true;
    await this.pages.loadPage(last.page);
    await this.canvas.apply(last.ids, last.oldObjects);
    this.locked = false;
    this.updateState();
  };

  redo = async (): Promise<void> => {
    if (!this.redoStack.length) return;
    const last = this.redoStack.pop();
    this.history.push(last);
    this.locked = true;
    await this.pages.loadPage(last.page);
    await this.canvas.apply(last.ids, last.newObjects);
    this.locked = false;
    this.updateState();
  };
}
