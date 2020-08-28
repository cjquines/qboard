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
  store: fabric.Object[];
  locked: boolean = false;

  constructor(
    public canvas: Page,
    public pages: Pages,
    public updateState: () => void
  ) {}

  add = async (objects: any[]): Promise<void> => {
    if (this.locked) return;
    this.save({
      ids: objects.map((object) => object.id),
      oldObjects: null,
      newObjects: await this.canvas.serialize(objects),
      page: this.pages.currentIndex,
    });
    this.updateState();
  };

  remove = async (objects: any[]): Promise<void> => {
    if (this.locked) return;
    this.save({
      ids: objects.map((object) => object.id),
      oldObjects: await this.canvas.serialize(objects),
      newObjects: null,
      page: this.pages.currentIndex,
    });
    this.updateState();
  };

  modify = async (objects: any[]): Promise<void> => {
    if (this.locked) return;
    this.save({
      ids: objects.map((object) => object.id),
      oldObjects: this.store,
      newObjects: await this.canvas.serialize(objects),
      page: this.pages.currentIndex,
    });
    this.updateState();
  };

  save = async (item: HistoryItem): Promise<void> => {
    if (this.locked) return;
    this.history.push(item);
    this.redoStack = [];
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
