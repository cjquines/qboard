import keyboardJS from "keyboardjs";

import { Action } from "./action";

export type KeyMap = {
  [key: string]: Action;
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

  "1": Action.Help,
  "0": Action.Help,
  "/": Action.Help,
  "shift + /": Action.Help,
};

export default class KeyboardHandler {
  keyMap: KeyMap = {};

  constructor(
    public doAction: (action: Action) => void,
    public setStrict: (strict: boolean) => void,
    public updateState: () => void
  ) {
    keyboardJS.bind(
      "shift",
      () => {
        this.setStrict(true);
      },
      () => {
        this.setStrict(false);
      }
    );

    const keyMap = window.localStorage.getItem("keyMap");
    if (keyMap === null) {
      this.reset();
    } else {
      this.keyMap = JSON.parse(keyMap);
      this.bindAll();

      // for backwards compatibility, ensure help is bound
      if (
        Object.values(this.keyMap).every((action) => action !== Action.Help)
      ) {
        this.bind("0", Action.Help);
        this.bind("1", Action.Help);
        this.bind("/", Action.Help);
        this.bind("shift + /", Action.Help);
      }
    }
  }

  save = (): void => {
    window.localStorage.setItem("keyMap", JSON.stringify(this.keyMap));
  };

  /**
   * Removes the map from `localStorage`
   */
  clear = (): void => {
    window.localStorage.removeItem("keyMap");
  };

  bindAll = (): void => {
    for (const [key, value] of Object.entries(this.keyMap)) {
      this.bind(key, value);
    }
    this.updateState();
  };

  unbind = (key: string): void => {
    delete this.keyMap[key];
    keyboardJS.unbind(key);
    this.updateState();
    this.save();
  };

  bind = (key: string, action: Action): void => {
    this.keyMap[key] = action;
    keyboardJS.bind(key, () => this.doAction(this.keyMap[key]));
    this.updateState();
    this.save();
  };

  reset = (): void => {
    for (const key of Object.keys(this.keyMap)) {
      keyboardJS.unbind(key);
    }
    this.keyMap = { ...defaultKeys };
    this.bindAll();
    this.clear();
  };
}
