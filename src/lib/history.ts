import { fabric } from "fabric";

import Page from "./page";
import Pages from "./pages";
import { FabricObject, ObjectId } from "../types/fabric";
import AssertType from "../types/assert";

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
  latestId = 0;
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

  /**
   * Creates a history event adding {@param objects} if it is nonempty.
   */
  add = (objects?: fabric.Object[]): void => {
    if (objects?.length) this.save({ newObjects: objects });
  };

  /**
   * Creates a history event removing {@param objects} if it is nonempty.
   */
  remove = (objects?: fabric.Object[]): void => {
    if (objects?.length) this.save({ oldObjects: objects });
  };

  clear = (clearRedo = false): void => {
    this.history = [];
    if (clearRedo) this.redoStack = [];
    this.updateState();
  };

  /**
   * Have history remember the current selection {@param objects},
   * in case it is deleted/modified.
   */
  store = (objects: readonly fabric.Object[]): void => {
    if (this.locked) return;
    this.locked = true;
    this.selection = this.canvas.serialize(objects);
    this.locked = false;
  };

  /**
   * If the active selection (known to history) is modified to become {@param objects}
   */
  modify = (objects: fabric.Object[]): void =>
    this.save({ oldObjects: this.selection, newObjects: objects });

  private getNextId = (): number => {
    return ++this.latestId;
  };

  private setIdIfNotPresent = (object: FabricObject): number => {
    AssertType<ObjectId>(object);
    return (object.id = object.id ?? this.getNextId());
  };

  /**
   * Adds an entry to the history stack where {@param oldObjects} are replaced by {@param newObjects}.
   * Does not check to make sure that these are nonempty;
   * you may be creating an empty entry in history in this case.
   */
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
      ids: basis.map(this.setIdIfNotPresent),
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
