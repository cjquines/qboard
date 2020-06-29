import { fabric } from "fabric";
import keyboardJS from "keyboardjs";

import { Tool } from "./tools";
import { Pages } from "./pages";
import { ClipboardHandler } from "./clipboard";
import { HistoryHandler } from "./history";
import { Dash, Stroke, Fill } from "./styles";

const toolMap = {
  e: Tool.Ellipse,
  r: Tool.Rectangle,
  d: Tool.Pen,
  x: Tool.Eraser,
  c: Tool.Line,
  v: Tool.Move,
};

const dashMap = {
  w: Dash.Dotted,
  a: Dash.Dashed,
  s: Dash.Solid,
};

const strokeMap = {
  e: Stroke.Blue,
  r: Stroke.Green,
  f: Stroke.Black,
  c: Stroke.Yellow,
  v: Stroke.Orange,
};

const fillMap = {
  d: Fill.Solid,
  g: Fill.HalfSolid,
};

export class KeyboardHandler {
  combo: string[] = [];
  actionMap: any;

  constructor(
    public switchTool: (tool: Tool) => Promise<void>,
    public pages: Pages,
    public history: HistoryHandler,
    public clipboard: ClipboardHandler,
    public setStyle: (
      dash: Dash | null,
      stroke: Stroke | null,
      fill: Fill | null
    ) => void
  ) {
    this.actionMap = {
      w: clipboard.copy,
      a: pages.previousPage,
      s: pages.nextOrNewPage,
      f: history.undo,
      F: history.redo,
      g: clipboard.paste,
      esc: this.pages.canvas.discardActiveObject,
    };

    const keys = "wertasdfgxcv".split("");
    keys.push("space", "shift", "esc");
    for (const key of keys) {
      keyboardJS.bind(
        key,
        (e) => this.combo.push(key),
        (e) => this.read()
      );
    }
  }

  read = async (): Promise<void> => {
    if (!this.combo.length) return;
    if (this.combo.length === 1) {
      this.readSingle(this.combo[0]);
    } else if (this.combo.includes("shift")) {
      let key = this.combo[0];
      if (key === "shift") key = this.combo[1];
      this.readSingle(key.toUpperCase());
    } else if (this.combo.length <= 3) {
      this.readStyle(this.combo);
    }
    this.combo = [];
    return;
  };

  readSingle = async (key: string): Promise<void> => {
    if (key in toolMap) {
      this.switchTool(toolMap[key]);
    } else if (key in this.actionMap) {
      this.actionMap[key]();
    }
  };

  readStyle = async (keys: string[]): Promise<void> => {
    let dash = null,
      stroke = null,
      fill = Fill.Transparent;
    keys.forEach((key) => {
      dash = dashMap[key] || dash;
      stroke = strokeMap[key] || stroke;
      fill = fillMap[key] || fill;
    });
    this.setStyle(dash, stroke, fill);
  };
}
