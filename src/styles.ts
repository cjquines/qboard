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

export class StyleHandler {
  constructor(
    public drawerOptions: fabric.IObjectOptions,
    public freeDrawingBrush: any,
    public updateState: () => void,
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
      if (fill === Fill.Transparent) {
        this.drawerOptions.fill = "transparent";
      } else if (fill === Fill.Solid) {
        this.drawerOptions.fill = this.drawerOptions.stroke;
      } else if (fill === Fill.HalfSolid) {
        this.drawerOptions.fill = this.drawerOptions.stroke + "11";
      }
    }

    this.updateState();
  };
}
