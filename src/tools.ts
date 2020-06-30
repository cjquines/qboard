import { fabric } from "fabric";

export const enum Tool {
  Move,
  Pen,
  Eraser,
  Line,
  Rectangle,
  Ellipse,
}

export interface ToolHandler {
  tool: Tool;

  draw?: (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ) => Promise<fabric.Object>;

  resize?: (
    object: fabric.Object,
    x2: number,
    y2: number
  ) => Promise<fabric.Object>;

  setBrush?: (brush: any, options: fabric.IObjectOptions) => Promise<void>;
}

export class MoveHandler implements ToolHandler {
  tool: Tool = Tool.Move;

  setBrush = async (
    brush: any,
    options: fabric.IObjectOptions
  ): Promise<void> => {};
}

export class PenHandler implements ToolHandler {
  tool: Tool = Tool.Pen;

  setBrush = async (
    brush: any,
    options: fabric.IObjectOptions
  ): Promise<void> => {
    brush.color = options.stroke;
    brush.strokeDashArray = options.strokeDashArray;
    brush.width = options.strokeWidth;
  };
}

export class EraserHandler implements ToolHandler {
  tool: Tool = Tool.Eraser;

  setBrush = async (
    brush: any,
    options: fabric.IObjectOptions
  ): Promise<void> => {
    brush.color = "#ff005455";
    brush.strokeDashArray = [0, 0];
    brush.width = 5 * options.strokeWidth;
  };
}

export class LineHandler implements ToolHandler {
  tool: Tool = Tool.Line;

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Line> => {
    return new Promise<fabric.Line>((resolve) => {
      resolve(new fabric.Line([x, y, x2, y2], options));
    });
  };

  resize = async (
    object: fabric.Line,
    x2: number,
    y2: number
  ): Promise<fabric.Line> => {
    object.set({ x2, y2 }).setCoords();
    return new Promise<fabric.Line>((resolve) => {
      resolve(object);
    });
  };
}

export class RectangleHandler implements ToolHandler {
  tool: Tool = Tool.Rectangle;
  x: number;
  y: number;

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Rect> => {
    this.x = x;
    this.y = y;

    return new Promise<fabric.Rect>((resolve) => {
      resolve(
        new fabric.Rect({ left: x, top: y, width: x2, height: y2, ...options })
      );
    });
  };

  resize = async (
    object: fabric.Rect,
    x2: number,
    y2: number
  ): Promise<fabric.Rect> => {
    object
      .set({
        originX: this.x > x2 ? "right" : "left",
        originY: this.y > y2 ? "bottom" : "top",
        width: Math.abs(this.x - x2),
        height: Math.abs(this.y - y2),
      })
      .setCoords();

    return new Promise<fabric.Rect>((resolve) => {
      resolve(object);
    });
  };
}

export class EllipseHandler implements ToolHandler {
  tool: Tool = Tool.Ellipse;
  x: number;
  y: number;

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Ellipse> => {
    this.x = x;
    this.y = y;

    return new Promise<fabric.Ellipse>((resolve) => {
      resolve(
        new fabric.Ellipse({ left: x, top: y, rx: x2, ry: y2, ...options })
      );
    });
  };

  resize = async (
    object: fabric.Ellipse,
    x2: number,
    y2: number
  ): Promise<fabric.Ellipse> => {
    object
      .set({
        originX: this.x > x2 ? "right" : "left",
        originY: this.y > y2 ? "bottom" : "top",
        rx: Math.abs(x2 - object.left) / 2,
        ry: Math.abs(y2 - object.top) / 2,
      })
      .setCoords();

    return new Promise<fabric.Ellipse>((resolve) => {
      resolve(object);
    });
  };
}

export const Handlers = [
  new MoveHandler(),
  new PenHandler(),
  new EraserHandler(),
  new LineHandler(),
  new RectangleHandler(),
  new EllipseHandler(),
];
