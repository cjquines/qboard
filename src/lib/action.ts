import { fabric } from "fabric";

import { Tool } from "./tools";
import { Pages } from "./pages";
import { ClipboardHandler } from "./clipboard";
import { HistoryHandler } from "./history";
import { Dash, Stroke, Fill, Style } from "./styles";

export enum Action {
  PreviousPage = "previousPage",
  NextPage = "nextPage",
  AddPage = "addPage",

  Undo = "undo",
  Redo = "redo",

  Save = "save",
  Cut = "cut",
  Copy = "copy",
  Paste = "paste",

  Deselect = "deselect",
  SelectAll = "selectAll",
  Duplicate = "duplicate",

  Move = "move",
  Pen = "pen",
  Eraser = "eraser",
  Laser = "laser",
  Line = "line",
  Ellipse = "ellipse",
  Rectangle = "rectangle",

  Dotted = "dotted",
  Dashed = "dashed",
  Solid = "solid",

  Black = "black",
  Blue = "blue",
  Green = "green",
  Orange = "orange",
  Yellow = "yellow",

  Transparent = "transparent",
  HalfFilled = "halfFilled",
  Filled = "filled",

  ResetStyles = "resetStyles",
  FullScreen = "fullScreen",
  EnterFullScreen = "enterFullScreen",
  ExitFullScreen = "exitFullScreen",
}

const nameMap = {
  previousPage: "–Page",
  nextPage: "+Page",
  addPage: "+Page",
  selectAll: "Select All",
  duplicate: "Clone",
  eraser: "Cut / Eraser",
  rectangle: "Rect.",
  transparent: "Unfilled",
  halfFilled: "Half Fill",
  resetStyles: "Reset Styles",
  fullScreen: "Full Screen",
  enterFullScreen: "Enter Full Screen",
  exitFullScreen: "Exit Full Screen",
};

export const actionName = (action: Action): string => {
  const name = nameMap[action] || action;
  return name && name[0].toUpperCase() + name.slice(1);
};

export class ActionHandler {
  canvas: fabric.Canvas;
  actionMap: any;

  constructor(
    public switchTool: (tool: Tool) => Promise<void>,
    public currentStyle: Style,
    public pages: Pages,
    public history: HistoryHandler,
    public clipboard: ClipboardHandler,
    public setStyle: (
      dash: Dash | null,
      stroke: Stroke | null,
      fill: Fill | null
    ) => void,
    public updateState: () => void
  ) {
    this.canvas = this.pages.canvas;

    this.actionMap = {
      previousPage: pages.previousPage,
      nextPage: pages.nextOrNewPage,
      addPage: pages.nextOrNewPage,

      undo: history.undo,
      redo: history.redo,

      save: pages.export,
      cut: clipboard.cut,
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
      duplicate: () => this.clipboard.copy().then(() => this.clipboard.paste()),

      move: () => this.switchTool(Tool.Move),
      pen: () => this.switchTool(Tool.Pen),
      eraser: () => this.switchTool(Tool.Eraser),
      laser: () => this.switchTool(Tool.Laser),
      line: () => this.switchTool(Tool.Line),
      ellipse: () => this.switchTool(Tool.Ellipse),
      rectangle: () => this.switchTool(Tool.Rectangle),

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

      resetStyles: () =>
        this.setStyle(Dash.Solid, Stroke.Black, Fill.Transparent),
      fullScreen: () =>
        this.doAction(
          !document.fullscreenElement
            ? Action.EnterFullScreen
            : Action.ExitFullScreen
        ),
      enterFullScreen: () => document.documentElement.requestFullscreen(),
      exitFullScreen: () => document.exitFullscreen(),
    };
  }

  doAction = async (action: Action): Promise<void> => this.actionMap[action]();

  setDash = async (dash: Dash): Promise<void> => {
    if (dash === this.currentStyle.dash) {
      this.setStyle(Dash.Solid, null, null);
    } else {
      this.setStyle(dash, null, null);
    }
  };

  setStroke = async (stroke: Stroke): Promise<void> => {
    if (stroke === this.currentStyle.stroke) {
      this.setStyle(null, Stroke.Black, null);
    } else {
      this.setStyle(null, stroke, null);
    }
  };

  setFill = async (fill: Fill): Promise<void> => {
    if (fill === this.currentStyle.fill) {
      this.setStyle(null, null, Fill.Transparent);
    } else {
      this.setStyle(null, null, fill);
    }
  };
}
