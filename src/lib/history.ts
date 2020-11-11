import { fabric } from "fabric";

import Page, { ObjectId } from "./page";
import Pages from "./pages";

interface HistoryItem {
  ids: number[];
  oldObjects: fabric.Object[] | null;
  newObjects: fabric.Object[] | null;
  page: number;
}

export type HistoryCommand = {
  add?: fabric.Object[];
  remove?: fabric.Object[];
  clear?: [boolean];
};

export default class HistoryHandler {
  history: HistoryItem[] = [];
  redoStack: HistoryItem[] = [];
  selection: fabric.Object[];
  locked = false;

  constructor(
    public canvas: Page,
    public pages: Pages,
    public updateState: () => void
  ) {}

  execute = async (command: HistoryCommand = {}): Promise<void[]> => {
    if (command.clear) this.clear(command.clear[0]);
    const actions: Promise<void>[] = [
      this.add(command.add),
      this.remove(command.remove),
    ];
    return Promise.all(actions);
  };

  add = async (objects: fabric.Object[]): Promise<void> =>
    objects?.length && this.save(null, objects);

  remove = async (objects: fabric.Object[]): Promise<void> =>
    objects?.length && this.save(objects, null);

  clear = (clearRedo = false): void => {
    this.history = [];
    if (clearRedo) this.redoStack = [];
    this.updateState();
  };

  store = async (objects: fabric.Object[]): Promise<void> => {
    if (this.locked) return;
    this.selection = await this.canvas.serialize(objects);
  };

  modify = async (objects: fabric.Object[]): Promise<void> =>
    this.save(this.selection, objects);

  save = async (
    oldObjects: fabric.Object[] | null,
    newObjects: fabric.Object[] | null
  ): Promise<void> => {
    if (this.locked) return;
    const basis = newObjects || oldObjects;
    this.history.push({
      ids: basis.map((object: ObjectId) => object.id),
      oldObjects: newObjects
        ? oldObjects
        : await this.canvas.serialize(oldObjects),
      newObjects: newObjects && (await this.canvas.serialize(newObjects)),
      page: this.pages.currentIndex,
    });
    this.redoStack = [];
    this.canvas.modified = true;
    this.updateState();
  };

  undo = async (): Promise<void> => {
    if (!this.history.length) return;
    this.canvas.discardActiveObject();
    await this.move(this.history, this.redoStack, true);
  };

  redo = async (): Promise<void> => {
    if (!this.redoStack.length) return;
    await this.move(this.redoStack, this.history, false);
  };

  private move = async (
    from: HistoryItem[],
    to: HistoryItem[],
    isUndo: boolean
  ): Promise<void> => {
    this.locked = true;
    const last = from.pop();
    await this.pages.loadPage(last.page);
    this.canvas.apply(last.ids, isUndo ? last.oldObjects : last.newObjects);
    to.push(last);
    this.locked = false;
    this.canvas.modified = true;
    this.updateState();
  };
}
