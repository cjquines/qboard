import keyboardJS from "keyboardjs";

import { Action } from "./action";

export type KeyMap = {
  [key: string]: Action;
};
export type MirrorMap = {
  [key: string]: string;
};

export const defaultKeys: KeyMap = {
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

  "ctrl + a": Action.SelectAll,
  "ctrl + s": Action.Save,
  "ctrl + d": Action.Duplicate,
  "ctrl + z": Action.Undo,
  "ctrl + x": Action.Cut,
  "ctrl + c": Action.Copy,
};

const mirrorMap: MirrorMap = {
  tab: "[",
  q: "p",
  w: "o",
  e: "i",
  r: "u",
  t: "y",
  esc: "'",
  a: ";",
  s: "l",
  d: "k",
  f: "j",
  g: "h",
  shift: "shift",
  z: "/",
  x: ".",
  c: ",",
  v: "m",
  b: "n",
};

export const mirror = (key: string): string => {
  return mirrorMap[key] || key.slice(0, -1) + mirrorMap[key.slice(-1)];
};

export default class KeyboardHandler {
  keyMap: any = {};

  constructor(
    public doAction: (action: Action) => Promise<void>,
    public setStrict: (strict: boolean) => void,
    public updateState: () => void
  ) {
    keyboardJS.bind(
      "shift",
      (e) => {
        this.setStrict(true);
      },
      (e) => {
        this.setStrict(false);
      }
    );

    if (!window.localStorage.getItem("keyMap")) {
      this.reset();
    } else {
      this.keyMap = JSON.parse(window.localStorage.getItem("keyMap"));
      this.bindAll();
    }
  }

  save = (): void => {
    window.localStorage.setItem("keyMap", JSON.stringify(this.keyMap));
  };

  bindAll = (): void => {
    for (const [key, value] of Object.entries(this.keyMap)) {
      this.bind(key, value as Action);
    }
    this.updateState();
  };

  unbind = (key: string): void => {
    delete this.keyMap[key];
    keyboardJS.unbind(key);
    keyboardJS.unbind(mirror(key));
    this.updateState();
    this.save();
  };

  bind = (key: string, action: Action): void => {
    this.keyMap[key] = action;
    keyboardJS.bind(key, (e) => this.doAction(this.keyMap[key]));
    keyboardJS.bind(mirror(key), (e) => this.doAction(this.keyMap[key]));
    this.updateState();
    this.save();
  };

  reset = (): void => {
    for (const key in this.keyMap) {
      keyboardJS.unbind(key);
      keyboardJS.unbind(mirror(key));
    }
    this.keyMap = { ...defaultKeys };
    this.bindAll();
    this.save();
  };
}
