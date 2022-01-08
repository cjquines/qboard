import { fabric } from "fabric";

import Page from "./page";
import Pages from "./pages";
import { ObjectId } from "../types/fabric";

interface HistoryItem {
  ids: readonly number[];
  oldObjects: fabric.Object[] | null;
  newObjects: fabric.Object[] | null;
  page: number;
}

export interface HistoryCommand {
  add?: fabric.Object[];
  remove?: fabric.Object[];
  clear?: readonly [boolean];
}

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

  /**
   * Behavior is undefined if the same object is in both the `add` and `remove` properties of {@param command}
   */
  execute = (command: HistoryCommand = {}): void => {
    if (command.clear) this.clear(command.clear[0]);
    this.add(command.add);
    this.remove(command.remove);
  };

  add = (objects?: fabric.Object[]): void => {
    if (objects?.length) this.save({ newObjects: objects });
  };

  remove = (objects?: fabric.Object[]): void => {
    if (objects?.length) this.save({ oldObjects: objects });
  };

  clear = (clearRedo = false): void => {
    this.history = [];
    if (clearRedo) this.redoStack = [];
    this.updateState();
  };

  store = (objects: readonly fabric.Object[]): void => {
    if (this.locked) return;
    this.locked = true;
    this.selection = this.canvas.serialize(objects);
    this.locked = false;
  };

  modify = (objects: fabric.Object[]): void =>
    this.save({ oldObjects: this.selection, newObjects: objects });

  private save = ({
    oldObjects,
    newObjects,
  }:
    | { oldObjects: fabric.Object[]; newObjects? }
    | {
        oldObjects?;
        newObjects: fabric.Object[];
      }): void => {
    if (this.locked) return;
    const basis = newObjects || oldObjects;
    this.locked = true;
    this.history.push({
      ids: basis.map((object) => (object as ObjectId).id),
      oldObjects: newObjects ? oldObjects : this.canvas.serialize(oldObjects),
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
    if (!from.length) return;
    this.locked = true;
    const last = from.pop()!;
    await this.pages.loadPage(last.page);
    this.canvas.apply(last.ids, isUndo ? last.oldObjects : last.newObjects);
    to.push(last);
    this.locked = false;
    this.canvas.modified = true;
    this.updateState();
  };
}
