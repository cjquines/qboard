import { fabric } from "fabric";
import React from "react";
import { PartialRecord } from "@mehra/ts";

import AssertType from "../types/assert";
import { FabricTeXImage } from "../types/fabric";

import { Tool, Tools } from "./tools";
import Pages from "./pages";
import FileHandler from "./files";
import ClipboardHandler from "./clipboard";
import HistoryHandler from "./history";
import { Dash, Fill, Stroke, Style } from "./styles";
import Page from "./page";
import TeXToDataURL, { LaTeXError } from "./latex";

export enum Action {
  PreviousPage = "previousPage",
  NextPage = "nextPage",
  AddPageStart = "addPageStart",
  AddPageEnd = "addPageEnd",

  Undo = "undo",
  Redo = "redo",

  Open = "open",
  Save = "save",
  Export = "export",
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
  LaTeX = "latex",

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

  Help = "help",
  ResetStyles = "resetStyles",
  FullScreen = "fullScreen",
  EnterFullScreen = "enterFullScreen",
  ExitFullScreen = "exitFullScreen",
}

const nameMap: PartialRecord<Action, string> = {
  previousPage: "–Page",
  nextPage: "+Page",
  addPageStart: "-Page",
  addPageEnd: "+Page",
  selectAll: "Select All",
  duplicate: "Clone",
  eraser: "Cut / Eraser",
  rectangle: "Rect.",
  latex: "LaTeX",
  transparent: "Unfilled",
  halfFilled: "Half Fill",
  resetStyles: "Reset Styles",
  fullScreen: "Full Screen",
  enterFullScreen: "Enter Full Screen",
  exitFullScreen: "Exit Full Screen",
};

export const actionName = (action: Action): string => {
  const name = nameMap[action] ?? action;
  return name[0].toUpperCase() + name.slice(1);
};

export default class ActionHandler {
  canvas: Page;
  readonly actionMap: Record<Action, () => void>;

  constructor(
    public switchTool: (tool: Tool) => void,
    tools: Tools,
    public currentStyle: Style,
    public pages: Pages,
    public files: FileHandler,
    public history: HistoryHandler,
    public clipboard: ClipboardHandler,
    public setStyle: (
      dash: Dash | null,
      stroke: Stroke | null,
      fill: Fill | null
    ) => void,
    /**
     * Intentionally mutable global state object
     */
    private globalState: {
      /**
       * A ref to the global input element used for file input
       *
       * Readonly because we ourselves don't mutate this
       */
      readonly fileInputRef?: React.RefObject<HTMLInputElement>;
      readonly toggleHelpModal?: () => void;
    }
  ) {
    this.canvas = this.pages.canvas;

    this.actionMap = {
      previousPage: pages.previousOrNewPage,
      nextPage: pages.nextOrNewPage,
      addPageStart: pages.previousOrNewPage,
      addPageEnd: pages.nextOrNewPage,

      undo: history.undo,
      redo: history.redo,

      open: () => globalState.fileInputRef?.current?.click(),
      save: pages.saveFile,
      export: pages.export,
      cut: clipboard.cut,
      copy: clipboard.copy,
      paste: clipboard.paste,

      deselect: () => {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      },
      selectAll: () => {
        this.canvas.discardActiveObject();
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

      move: () => this.switchTool(tools.Move),
      pen: () => this.switchTool(tools.Pen),
      eraser: () => this.switchTool(tools.Eraser),
      laser: () => this.switchTool(tools.Laser),
      line: () => this.switchTool(tools.Line),
      ellipse: () => this.switchTool(tools.Ellipse),
      rectangle: () => this.switchTool(tools.Rectangle),
      latex: this.requestTeX,

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
      help: () => globalState.toggleHelpModal?.(),
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

  doAction = (action: Action): void => this.actionMap[action]();

  setDash = (dash: Dash): void => {
    if (dash === this.currentStyle.dash) {
      this.setStyle(Dash.Solid, null, null);
    } else {
      this.setStyle(dash, null, null);
    }
  };

  setStroke = (stroke: Stroke): void => {
    if (stroke === this.currentStyle.stroke) {
      this.setStyle(null, Stroke.Black, null);
    } else {
      this.setStyle(null, stroke, null);
    }
  };

  setFill = (fill: Fill): void => {
    if (fill === this.currentStyle.fill) {
      this.setStyle(null, null, Fill.Transparent);
    } else {
      this.setStyle(null, null, fill);
    }
  };

  requestTeX = async (): Promise<
    "success" | "no latex entered" | "invalid latex"
  > => {
    const text = window.prompt("Enter LaTeX source");
    if (text === null) return "no latex entered";

    let dataURL: `data:image/svg+xml,${string}`;
    try {
      dataURL = TeXToDataURL(text);
    } catch (e: unknown) {
      AssertType<LaTeXError>(e);
      // eslint-disable-next-line no-console
      console.error(e, e.node);
      window.alert(
        `Error in LaTeX: ${e.errorText}

More details printed to console.`
      );

      return "invalid latex";
    }

    const img: FabricTeXImage = await this.canvas.addImage(
      dataURL,
      {},
      { scaleX: 3, scaleY: 3, data: { texSource: text } }
    );

    this.history.add([img]);

    // apparently this does something?
    await this.history.undo();
    await this.history.redo();

    return "success";
  };
}
