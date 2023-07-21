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
    constructor(doAction, setStrict, updateState) {
        this.doAction = doAction;
        this.setStrict = setStrict;
        this.updateState = updateState;
        this.keyMap = {};
        /**
         * Writes the map to `localStorage`
         */
        this.save = () => {
            window.localStorage.setItem("keyMap", JSON.stringify(this.keyMap));
        };
        /**
         * Removes the map from `localStorage`
         */
        this.clear = () => {
            window.localStorage.removeItem("keyMap");
        };
        /**
         * Wrapper to bind every binding defined in `this.keyMap`,
         * writing to `localStorage` if {@param save}
         */
        this.bindAll = (save = false) => {
            for (const [key, value] of Object.entries(this.keyMap)) {
                this.bind(key, value, save);
            }
            this.updateState();
        };
        this.unbind = (key) => {
            delete this.keyMap[key];
            keyboardJS.unbind(key);
            this.updateState();
            this.save();
        };
        /**
         * Creates a keyboard.js binding from the key combination {@param key} to the action {@param action},
         * writing to `localStorage` if {@param save}.
         * The binding reacts only to the `press` event and not the `release` event.
         */
        this.bind = (key, action, save = true) => {
            this.keyMap[key] = action;
            keyboardJS.bind(key, () => this.doAction(this.keyMap[key]));
            this.updateState();
            if (save)
                this.save();
        };
        this.reset = () => {
            for (const key of Object.keys(this.keyMap)) {
                keyboardJS.unbind(key);
            }
            this.keyMap = { ...defaultKeys };
            this.bindAll();
            this.clear();
        };
        keyboardJS.bind("shift", () => {
            this.setStrict(true);
        }, () => {
            this.setStrict(false);
        });
        const keyMap = window.localStorage.getItem("keyMap");
        if (keyMap === null) {
            this.reset();
        }
        else {
            this.keyMap = JSON.parse(keyMap);
            this.bindAll();
            // for backwards compatibility, ensure help is bound
            if (Object.values(this.keyMap).every((action) => action !== Action.Help)) {
                this.bind("0", Action.Help);
                this.bind("1", Action.Help);
                this.bind("/", Action.Help);
                this.bind("shift + /", Action.Help);
            }
        }
    }
}
