import { fabric } from "fabric";
import keyboardJS from "keyboardjs";

import { Action } from "./action";

export const defaultKeys = {
  q: Action.Laser,
  w: Action.Copy,
  e: Action.Blue,
  esc: Action.Deselect,
  r: Action.Green,
  a: Action.PreviousPage,
  s: Action.NextPage,
  d: Action.Pen,
  f: Action.Undo,
  g: Action.Paste,
  z: Action.ResetStyles,
  x: Action.Eraser,
  c: Action.Line,
  v: Action.Move,

  "shift + q": Action.Dotted,
  "shift + w": Action.Transparent,
  "shift + e": Action.Ellipse,
  "shift + r": Action.Rectangle,
  "shift + a": Action.Dashed,
  "shift + s": Action.HalfFilled,
  "shift + d": Action.Black,
  "shift + f": Action.Redo,
  "shift + z": Action.Solid,
  "shift + x": Action.Filled,
  "shift + c": Action.Yellow,
  "shift + v": Action.Orange,

  "ctrl + y": Action.Redo,
  "ctrl + a": Action.SelectAll,
  "ctrl + s": Action.Save,
  "ctrl + d": Action.Duplicate,
  "ctrl + z": Action.Undo,
  "ctrl + x": Action.Cut,
  "ctrl + c": Action.Copy,
  "ctrl + v": Action.Paste,
};

export class KeyboardHandler {
  canvas: fabric.Canvas;
  actionMap: any;
  keyMap: any;

  constructor(
    public doAction: (action: Action) => Promise<void>,
    public setStrict: (strict: boolean) => void,
    public updateState: () => void
  ) {
    this.reset();
    keyboardJS.bind(
      "shift",
      (e) => {
        this.setStrict(true);
      },
      (e) => {
        this.setStrict(false);
      }
    );
  }

  unbind = (key: string): void => {
    delete this.keyMap[key];
    keyboardJS.unbind(key);
    this.updateState();
  };

  bind = (key: string, action: Action): void => {
    this.keyMap[key] = action;
    keyboardJS.bind(key, (e) => this.doAction(this.keyMap[key]));
    this.updateState();
  };

  reset = (): void => {
    for (const key in this.keyMap) {
      keyboardJS.unbind(key);
    }
    this.keyMap = {};
    for (const key in defaultKeys) {
      this.bind(key, defaultKeys[key]);
    }
    this.updateState();
  };
}
