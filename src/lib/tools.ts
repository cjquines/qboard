import { fabric } from "fabric";
import Page from "./page";
import ClipboardHandler from "./clipboard";
import HistoryHandler from "./history";

class Behaviors {
  // given the origin x, y, snaps the point x2, y2 to the nearest vector in dirs
  static rectify = (
    dirs: number[][],
    x: number,
    y: number,
    x2: number,
    y2: number
  ): number[] => {
    return dirs
      .map((d) => Behaviors.project(x, y, d[0], d[1], x2, y2))
      .reduce((acc, cur) => (acc[0] < cur[0] ? acc : cur));
  };

  // projects the point x2, y2 to the vector with origin ox, oy and direction vx, vy. returns the square distance and the coordinates of the projection.
  private static project = (
    ox: number,
    oy: number,
    vx: number,
    vy: number,
    x2: number,
    y2: number
  ): number[] => {
    const x = x2 - ox;
    const y = y2 - oy;
    const side = vx * y - vy * x;
    const sq = vx * vx + vy * vy;
    return [
      Math.abs(side) / sq,
      ox + x + (vy * side) / sq,
      oy + y - (vx * side) / sq,
    ];
  };
}

export class ToolHandler {
  // Add type marker `boolean` so it can be overridden; otherwise takes type `false`
  /**
   * Make sure that no extending classes except BrushHandler set this to true;
   * the value of this property is used as a type guard.
   */
  readonly isBrush: boolean = false;
  /**
   * Make sure that no extending classes except DrawingToolHandler set this to true;
   * the value of this property is used as a type guard.
   */
  readonly isDrawing: boolean = false;
  /**
   * Make sure that no extending classes except DrawingToolHandler set this to true;
   * the value of this property is used as a type guard.
   */
  readonly requiresBase: boolean = false;

  resize: (
    object: fabric.Object,
    x2: number,
    y2: number,
    strict: boolean
  ) => fabric.Object | Promise<fabric.Object>;

  /**
   * Set with activate()
   * @private
   */
  private active: boolean;

  constructor(
    protected baseCanvas: Page,
    protected history: HistoryHandler,
    protected clipboard: ClipboardHandler
  ) {}

  /**
   * @return Whether the activation was successful.
   * Maybe want to throw error instead of return boolean.
   */
  activate: () => boolean | Promise<boolean> = () => (this.active = true);
  /**
   * Not allowed to fail
   */
  deactivate: () => void = () => (this.active = false);
  /**
   * get this.active
   */
  isActive = () => this.active;
}

export abstract class DrawingToolHandler extends ToolHandler {
  isDrawing = true;
  abstract draw: (
    x,
    y,
    options,
    x2?,
    y2?
  ) => fabric.Object | Promise<fabric.Object>;
}

export function isDrawing(tool: ToolHandler): tool is DrawingToolHandler {
  return tool.isDrawing;
}

export abstract class BrushHandler extends ToolHandler {
  isBrush = true;

  /**
   * Handle the pathCreated event
   */
  abstract pathCreated: (e: any) => void | Promise<void> = () => {};

  abstract setBrush: (
    brush: fabric.BaseBrush,
    options: fabric.IObjectOptions
  ) => void | Promise<void> = () => {};
}

export function isBrush(tool: ToolHandler): tool is BrushHandler {
  return tool.isBrush;
}

export class RequiresBaseHandler extends ToolHandler {
  requiresBase = true;
}

export function requiresBase(tool: ToolHandler): tool is RequiresBaseHandler {
  return tool.requiresBase;
}

export class MoveHandler extends RequiresBaseHandler {}

export class PenHandler extends BrushHandler {
  pathCreated = async (e) => {
    e.path.id = await this.baseCanvas.getNextId();
    return this.history.add([e.path]);
  };
  setBrush = (brush, options) => {
    brush.color = options.stroke;
    brush.strokeDashArray = options.strokeDashArray;
    brush.width = options.strokeWidth;
  };
}

export class EraserHandler extends BrushHandler {
  pathCreated = async (e) => {
    const path = fabric.util.object.clone(e.path);
    this.baseCanvas.remove(e.path);
    const objects = this.baseCanvas
      .getObjects()
      .filter((object) => object.intersectsWithObject(path));
    if (!objects.length) return;
    this.baseCanvas.remove(...objects);
    await this.history.remove(objects);
  };

  setBrush = (brush, options) => {
    brush.color = "#ff005455";
    brush.strokeDashArray = [0, 0];
    brush.width = 5 * options.strokeWidth;
  };

  activate = async () => (await this.clipboard.cut()) && super.activate();
}

export class LaserHandler extends BrushHandler {
  pathCreated = (e) => {
    setTimeout(async () => {
      this.baseCanvas.remove(e.path);
      this.baseCanvas.requestRenderAll();
    }, 1000);
  };
  setBrush = (brush, options) => {
    brush.color = "#f23523";
    brush.strokeDashArray = [0, 0];
    brush.width = options.strokeWidth;
  };
}

export class LineHandler extends DrawingToolHandler {
  isBrush = false;
  x: number;
  y: number;

  dirs: number[][] = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
  ];

  draw = (x, y, options, x2, y2): fabric.Line => {
    this.x = x;
    this.y = y;

    return new fabric.Line([x, y, x2, y2], {
      ...options,
      perPixelTargetFind: true,
    });
  };

  resize = (object, x2, y2, strict): fabric.Line => {
    let [x, y] = [x2, y2];
    if (strict) {
      [, x, y] = Behaviors.rectify(this.dirs, this.x, this.y, x2, y2);
    }
    object.set({ x2: x, y2: y }).setCoords();
    return object;
  };
}

export class RectangleHandler extends DrawingToolHandler {
  isBrush = false;
  x: number;
  y: number;

  dirs: number[][] = [
    [1, 1],
    [-1, 1],
  ];

  draw = (x, y, options, x2, y2): fabric.Rect => {
    this.x = x;
    this.y = y;

    return new fabric.Rect({
      left: x,
      top: y,
      width: x2,
      height: y2,
      ...options,
    });
  };

  resize = (
    object: fabric.Rect,
    x2: number,
    y2: number,
    strict: boolean
  ): fabric.Rect => {
    let [x, y] = [x2, y2];
    if (strict) {
      [, x, y] = Behaviors.rectify(this.dirs, this.x, this.y, x2, y2);
    }
    object
      .set({
        originX: this.x > x ? "right" : "left",
        originY: this.y > y ? "bottom" : "top",
        width: Math.abs(this.x - x),
        height: Math.abs(this.y - y),
      })
      .setCoords();

    return object;
  };
}

export class EllipseHandler extends DrawingToolHandler {
  isBrush = false;
  x: number;
  y: number;

  dirs: number[][] = [
    [1, 1],
    [-1, 1],
  ];

  draw = (x, y, options, x2, y2): fabric.Ellipse => {
    this.x = x;
    this.y = y;

    return new fabric.Ellipse({ ...options, left: x, top: y, rx: x2, ry: y2 });
  };

  resize = (
    object: fabric.Ellipse,
    x2: number,
    y2: number,
    strict: boolean
  ): fabric.Ellipse => {
    let [x, y] = [x2, y2];

    if (strict) {
      [, x, y] = Behaviors.rectify(this.dirs, this.x, this.y, x2, y2);
    }
    object
      .set({
        originX: this.x > x ? "right" : "left",
        originY: this.y > y ? "bottom" : "top",
        rx: Math.abs(x - object.left) / 2,
        ry: Math.abs(y - object.top) / 2,
      })
      .setCoords();

    return object;
  };
}

export default class Handlers {
  static from = (
    baseCanvas: Page,
    history: HistoryHandler,
    clipboard: ClipboardHandler
  ) => ({
    Move: new MoveHandler(baseCanvas, history, clipboard),
    Pen: new PenHandler(baseCanvas, history, clipboard),
    Eraser: new EraserHandler(baseCanvas, history, clipboard),
    Laser: new LaserHandler(baseCanvas, history, clipboard),
    Line: new LineHandler(baseCanvas, history, clipboard),
    Rectangle: new RectangleHandler(baseCanvas, history, clipboard),
    Ellipse: new EllipseHandler(baseCanvas, history, clipboard),
  });
}
