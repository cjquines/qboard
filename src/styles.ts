import { fabric } from "fabric";

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

export class StyleHandler {
  constructor(
    public drawerOptions: fabric.IObjectOptions,
    public freeDrawingBrush: fabric.FreeDrawingBrush
  ) {}

  set = (dash: Dash | null, stroke: Stroke | null, fill: Fill | null): void => {
    if (dash === Dash.Solid) {
      this.drawerOptions.strokeDashArray = undefined;
    } else if (dash === Dash.Dashed) {
      this.drawerOptions.strokeDashArray = [20, 10];
    } else if (dash === Dash.Dotted) {
      this.drawerOptions.strokeDashArray = [5, 10];
    }
    if (stroke) {
      this.drawerOptions.stroke = stroke;
      this.freeDrawingBrush.color = stroke;
    }
    if (fill === Fill.Transparent) {
      this.drawerOptions.fill = "transparent";
      this.drawerOptions.opacity = 1;
    } else if (fill === Fill.Solid) {
      this.drawerOptions.fill = this.drawerOptions.stroke;
      this.drawerOptions.opacity = 1;
    } else if (fill === Fill.HalfSolid) {
      this.drawerOptions.fill = this.drawerOptions.stroke;
      this.drawerOptions.opacity = 0.3;
    }
  };
}
