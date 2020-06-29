import { fabric } from "fabric";
import keyboardJS from "keyboardjs";

export const enum Dash {
  Solid,
  Dashed,
  Dotted,
}

export const enum Stroke {
  Black = "#000000",
  Blue = "#0097f6",
  Green = "#00b253",
  Yellow = "#ffbf00",
  Orange = "#ff2600",
}

export const enum Fill {
  Transparent,
  Solid,
  HalfSolid,
}

const dashMap = [
  [0, 0],
  [20, 15],
  [5, 10],
];

const fillMap = [
  {
    fill: "transparent",
    opacity: 1,
  },
  {
    fill: "stroke",
    opacity: 1,
  },
  {
    fill: "stroke",
    opacity: 0.3,
  },
];

export class StyleHandler {
  constructor(
    public drawerOptions: fabric.IObjectOptions,
    public freeDrawingBrush: any
  ) {}

  set = (dash: Dash | null, stroke: Stroke | null, fill: Fill | null): void => {
    if (dash !== null) {
      this.drawerOptions.strokeDashArray = dashMap[dash];
      this.freeDrawingBrush.strokeDashArray = dashMap[dash];
    }

    if (stroke !== null) {
      this.drawerOptions.stroke = stroke;
      this.freeDrawingBrush.color = stroke;
    }

    if (fill !== null) {
      const { fill: fill_, opacity } = fillMap[fill];
      if (fill_ === "transparent") {
        this.drawerOptions.fill = "transparent";
      } else if (fill_ === "stroke") {
        this.drawerOptions.fill = this.drawerOptions.stroke;
      }
      this.drawerOptions.opacity = opacity;
    }
  };
}
