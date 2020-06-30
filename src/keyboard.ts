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
    this.canvas = this.pages.canvas;

    this.actionMap = {
      w: clipboard.copy,
      a: pages.previousPage,
      s: pages.nextOrNewPage,
      f: history.undo,
      g: clipboard.paste,
    };

    const keys = "wertasdfgxcv".split("");
    keys.push("space");
    for (const key of keys) {
      keyboardJS.bind(
        key,
        (e) => this.combo.push(key),
        (e) => this.read()
      );
    }

    keyboardJS.bind("shift + f", (e) => {
      this.history.redo();
    });

    keyboardJS.bind("space > space", (e) => {
      this.setStyle(Dash.Solid, Stroke.Black, Fill.Transparent);
    });

    keyboardJS.bind("esc", (e) => {
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    });

    keyboardJS.bind("ctrl + a", (e) => {
      this.canvas.setActiveObject(new fabric.ActiveSelection(this.canvas.getObjects(), {canvas: this.canvas}));
      this.canvas.requestRenderAll();
    });

    keyboardJS.bind("ctrl + s", (e) => {
      this.pages.export();
    });
  }

  read = async (): Promise<void> => {
    if (!this.combo.length) return;
    if (this.combo.length === 1) {
      this.readSingle(this.combo[0]);
    } else if (this.combo.length <= 3) {
      this.readStyle(this.combo);
    }
    this.combo = [];
  };

  readSingle = async (key: string): Promise<void> => {
    if (key in toolMap) {
      this.switchTool(toolMap[key]);
    } else if (key in this.actionMap) {
      this.actionMap[key]();
    }
  };

  readStyle = async (keys: string[]): Promise<void> => {
    console.log(keys);
    let dash = null,
      stroke = null,
      fill = Fill.Transparent,
      badKey = false;
    keys.forEach((key) => {
      const dChange = dashMap.hasOwnProperty(key),
        sChange = strokeMap.hasOwnProperty(key),
        fChange = fillMap.hasOwnProperty(key);
      if (!(dChange || sChange || fChange) && key !== "space") badKey = true;
      if (dChange) dash = dashMap[key];
      if (sChange) stroke = strokeMap[key];
      if (fChange) fill = fillMap[key];
    });
    if (badKey) return;
    this.setStyle(dash, stroke, fill);
  };
}
