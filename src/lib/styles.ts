import * as fabric from "fabric";

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

export interface Style {
  dash: Dash;
  stroke: Stroke;
  fill: Fill;
}

const dashMap = [
  [0, 0],
  [20, 15],
  [5, 10],
];

export default class StyleHandler {
  constructor(
    public currentStyle: Style,
    public drawerOptions: Partial<fabric.FabricObjectProps>,
    public freeDrawingBrush: fabric.BaseBrush,
    public updateState: () => void,
  ) {}

  set = (dash: Dash | null, stroke: Stroke | null, fill: Fill | null): void => {
    if (dash !== null) {
      this.currentStyle.dash = dash;
      this.drawerOptions.strokeDashArray = dashMap[dash];
      this.freeDrawingBrush.strokeDashArray = dashMap[dash];
    }

    if (stroke !== null) {
      this.currentStyle.stroke = stroke;
      this.drawerOptions.stroke = stroke;
      this.freeDrawingBrush.color = stroke;
    }

    if (fill !== null) {
      this.currentStyle.fill = fill;
    }

    if (stroke !== null || fill !== null) {
      switch (this.currentStyle.fill) {
        case Fill.Transparent: {
          this.drawerOptions.fill = "transparent";
          break;
        }
        case Fill.Solid: {
          this.drawerOptions.fill = this.currentStyle.stroke;
          break;
        }
        case Fill.HalfSolid: {
          this.drawerOptions.fill = `${this.currentStyle.stroke}11`;
          break;
        }
      }
    }

    this.updateState();
  };
}
