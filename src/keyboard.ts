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
  f: Fill.Solid,
  g: Fill.HalfSolid,
  space: null,
};

export class KeyboardHandler {
  canvas: fabric.Canvas;
  combo: string[] = [];
  actionMap: any;
  ctrlMap: any;

  constructor(
    public switchTool: (tool: Tool) => Promise<void>,
    public setStrict: (strict: boolean) => void,
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
      z: () => {
        this.setStyle(Dash.Solid, Stroke.Black, Fill.Transparent);
      },
    };

    const keys = "wertasdfgxcvz".split("");
    for (const key of keys) {
      keyboardJS.bind(
        key,
        (e) => this.combo.push(key),
        (e) => this.read()
      );

      keyboardJS.bind(
        `space + ${key}`,
        (e) => this.combo.push(key, "space"),
        (e) => this.read()
      );
    }

    this.ctrlMap = {
      y: history.redo,
      a: () => {
        this.canvas.setActiveObject(
          new fabric.ActiveSelection(this.canvas.getObjects(), {
            canvas: this.canvas,
          })
        );
        this.canvas.requestRenderAll();
      },
      s: pages.export,
      d: () => {
        this.clipboard.copy();
        this.clipboard.paste();
      },
      z: history.undo,
      x: clipboard.cut,
      c: clipboard.copy,
      v: clipboard.paste,
    };

    for (const key in this.ctrlMap) {
      keyboardJS.bind(`ctrl + ${key}`, (e) => this.ctrlMap[key]());
    }

    keyboardJS.bind("shift + f", (e) => {
      this.history.redo();
    });

    keyboardJS.bind("esc", (e) => {
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    });

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

  read = async (): Promise<void> => {
    if (!this.combo.length) return;
    const combo = Array.from(new Set(this.combo));
    this.combo = [];
    if (combo.length === 1) {
      this.readSingle(combo[0]);
    } else if (combo.length <= 3) {
      this.readStyle(combo);
    }
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
      fill = Fill.Transparent,
      badKey = false;
    keys.forEach((key) => {
      const dChange = dashMap.hasOwnProperty(key),
        sChange = strokeMap.hasOwnProperty(key),
        fChange = fillMap.hasOwnProperty(key);
      if (!(dChange || sChange || fChange)) badKey = true;
      if (dChange) dash = dashMap[key];
      if (sChange) stroke = strokeMap[key];
      if (fChange) fill = fillMap[key];
    });
    if (badKey) return;
    this.setStyle(dash, stroke, fill);
  };
}
