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
  selection: fabric.Object[] | null = null;
  locked = false;

  constructor(
    public canvas: Page,
    public pages: Pages,
    public updateState: () => void
  ) {}

  execute = (command: HistoryCommand = {}): void => {
    if (command.clear) this.clear(command.clear[0]);
    this.add(command.add);
    this.remove(command.remove);
  };

  add = (objects?: fabric.Object[]): void => {
    if (objects?.length) this.save(null, objects);
  };

  remove = (objects?: fabric.Object[]): void => {
    if(objects?.length) this.save(objects, null);
  };

  clear = (clearRedo = false): void => {
    this.history = [];
    if (clearRedo) this.redoStack = [];
    this.updateState();
  };

  store = (objects: fabric.Object[]): void => {
    if (this.locked) return;
    this.locked = true;
    this.selection = this.canvas.serialize(objects);
    this.locked = false;
  };

  modify = (objects: fabric.Object[]): void =>
    this.save(this.selection, objects);

  save = (
    oldObjects: fabric.Object[] | null,
    newObjects: fabric.Object[] | null
  ): void => {
    if (this.locked) return;
    // FIXME: Function signature removes need for this nonsense
    const basis = (newObjects || oldObjects) ?? ([] as fabric.Object[]);
    this.locked = true;
    this.history.push({
      ids: basis.map((object) => (object as ObjectId).id),
      // FIXME: Function signature removes need for non-null assertion
      oldObjects: newObjects ? oldObjects : this.canvas.serialize(oldObjects!),
      newObjects: newObjects && this.canvas.serialize(newObjects),
      page: this.pages.currentIndex,
    });
    this.locked = false;
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
    if(!from.length) return;
    const last = from.pop()!;
    await this.pages.loadPage(last.page);
    this.canvas.apply(last.ids, isUndo ? last.oldObjects : last.newObjects);
    to.push(last);
    this.locked = false;
    this.canvas.modified = true;
    this.updateState();
  };
}
