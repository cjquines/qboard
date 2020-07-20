import { fabric } from "fabric";
import keyboardJS from "keyboardjs";

import { Tool } from "./tools";
import { Pages } from "./pages";
import { ClipboardHandler } from "./clipboard";
import { HistoryHandler } from "./history";
import { Dash, Stroke, Fill, Style } from "./styles";

const defaultKeys = {
  "q": "laser",
  "w": "copy",
  "e": "blue",
  "r": "green",
  "a": "previousPage",
  "s": "nextPage",
  "d": "pen",
  "f": "undo",
  "g": "paste",
  "z": "resetStyles",
  "x": "eraser",
  "c": "line",
  "v": "move",

  "shift + q": "dotted",
  "shift + w": "transparent",
  "shift + e": "ellipse",
  "shift + r": "rectangle",
  "shift + a": "dashed",
  "shift + s": "halfFilled",
  "shift + d": "black",
  "shift + f": "redo",
  "shift + z": "solid",
  "shift + x": "filled",
  "shift + c": "yellow",
  "shift + v": "orange",

  "ctrl + y": "redo",
  "ctrl + a": "selectAll",
  "ctrl + s": "save",
  "ctrl + d": "duplicate",
  "ctrl + z": "undo",
  "ctrl + x": "cut",
  "ctrl + c": "copy",
  "ctrl + v": "paste",
};

export class KeyboardHandler {
  canvas: fabric.Canvas;
  combo: string[] = [];
  actionMap: any;
  keyMap: any;

  constructor(
    public switchTool: (tool: Tool) => Promise<void>,
    public setStrict: (strict: boolean) => void,
    public currentStyle: Style,
    public pages: Pages,
    public history: HistoryHandler,
    public clipboard: ClipboardHandler,
    public setStyle: (
      dash: Dash | null,
      stroke: Stroke | null,
      fill: Fill | null
    ) => void
  ) {
    this.canvas = this.pages.canvas;

    this.actionMap = {
      previousPage: pages.previousPage,
      nextPage: pages.nextOrNewPage,
      save: pages.export,

      undo: history.undo,
      redo: history.redo,

      copy: clipboard.copy,
      paste: clipboard.paste,

      deselect: () => {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      },
      selectAll: () => {
        this.canvas.setActiveObject(
          new fabric.ActiveSelection(this.canvas.getObjects(), {
            canvas: this.canvas,
          })
        );
        this.canvas.requestRenderAll();
      },
      duplicate: () => {
        this.clipboard.copy();
        this.clipboard.paste();
      },

      pen: () => this.switchTool(Tool.Pen),
      eraser: () => this.switchTool(Tool.Eraser),
      laser: () => this.switchTool(Tool.Laser),
      ellipse: () => this.switchTool(Tool.Ellipse),
      rectangle: () => this.switchTool(Tool.Rectangle),
      move: () => this.switchTool(Tool.Move),

      dotted: () => this.setDash(Dash.Dotted),
      dashed: () => this.setDash(Dash.Dashed),
      solid: () => this.setDash(Dash.Solid),

      blue: () => this.setStroke(Stroke.Blue),
      green: () => this.setStroke(Stroke.Green),
      yellow: () => this.setStroke(Stroke.Yellow),
      orange: () => this.setStroke(Stroke.Orange),
      black: () => this.setStroke(Stroke.Black),

      transparent: () => this.setFill(Fill.Transparent),
      halfFilled: () => this.setFill(Fill.HalfSolid),
      filled: () => this.setFill(Fill.Solid),

      resetStyles: () => this.setStyle(Dash.Solid, Stroke.Black, Fill.Transparent),
    }

    this.keyMap = defaultKeys;

    for (const key in this.keyMap) {
      keyboardJS.bind(`${key}`, (e) => this.actionMap[this.keyMap[key]]());
    }

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

  setDash = async (dash: Dash): Promise<void> => {
    if (dash === this.currentStyle.dash) {
      this.setStyle(Dash.Solid, null, null);
    } else {
      this.setStyle(dash, null, null);
    }
  }

  setStroke = async (stroke: Stroke): Promise<void> => {
    if (stroke === this.currentStyle.stroke) {
      this.setStyle(null, Stroke.Black, null);
    } else {
      this.setStyle(null, stroke, null);
    }
  }

  setFill = async (fill: Fill): Promise<void> => {
    if (fill === this.currentStyle.fill) {
      this.setStyle(null, null, Fill.Transparent);
    } else {
      this.setStyle(null, null, fill);
    }
  }
}
