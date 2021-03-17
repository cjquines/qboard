import { fabric } from "fabric";
import Page from "./page";
import ClipboardHandler from "./clipboard";
import HistoryHandler from "./history";
import { PathEvent, GuaranteedIObjectOptions } from "../types/fabric";
import AssertType from "../types/assert";

type Async<T = void> = T | Promise<T>;

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
  protected readonly _isBrush: boolean = false;
  /**
   * Make sure that no extending classes except DrawingToolHandler set this to true;
   * the value of this property is used as a type guard.
   */
  protected readonly _isDrawing: boolean = false;
  /**
   * Make sure that no extending classes except DrawingToolHandler set this to true;
   * the value of this property is used as a type guard.
   */
  protected readonly _requiresBase: boolean = false;

  isBrush(): this is BrushHandler {
    return this._isBrush;
  }

  isDrawing(): this is DrawingToolHandler {
    return this._isDrawing;
  }

  requiresBase(): this is RequiresBaseHandler {
    return this._requiresBase;
  }

  resize?: (
    object: fabric.Object,
    x2: number,
    y2: number,
    strict: boolean
  ) => Async<fabric.Object>;

  /**
   * Set externally from activate() and deactivate().
   * Set internally (from an extending class) with setActive();
   * @private
   */
  private active = false;

  constructor(
    protected baseCanvas: Page,
    protected history: HistoryHandler,
    protected clipboard: ClipboardHandler
  ) {}

  /**
   * @return Whether the activation was successful.
   * Maybe want to throw error instead of return boolean.
   */
  activate: () => Async<boolean> = () => this.setActive(true);

  /**
   * Not allowed to fail
   */
  deactivate: () => void = () => this.setActive(false);

  /**
   * get this.active
   */
  isActive = (): boolean => this.active;

  /**
   * set this.active active
   */
  protected setActive = (active: boolean): boolean => (this.active = active);
}

export abstract class DrawingToolHandler extends ToolHandler {
  _isDrawing = true;
  abstract draw: (
    x,
    y,
    options,
    x2?,
    y2?
  ) => fabric.Object | Promise<fabric.Object>;
}

export abstract class BrushHandler extends ToolHandler {
  _isBrush = true;

  /**
   * Handle the pathCreated event
   */
  pathCreated: (e: PathEvent) => void = () => {};

  setBrush: (
    brush: fabric.BaseBrush,
    options: GuaranteedIObjectOptions
  ) => void | Promise<void> = () => {};
}

export class RequiresBaseHandler extends ToolHandler {
  _requiresBase = true;
}

export class MoveHandler extends RequiresBaseHandler {}

export class PenHandler extends BrushHandler {
  pathCreated = (e: PathEvent): void => {
    e.path.id = this.baseCanvas.getNextId();
    this.history.add([e.path]);
  };
  setBrush = (
    brush: fabric.BaseBrush,
    options: GuaranteedIObjectOptions
  ): void => {
    brush.color = options.stroke;
    brush.strokeDashArray = options.strokeDashArray;
    brush.width = options.strokeWidth;
  };
}

export class EraserHandler extends BrushHandler {
  pathCreated = (e: PathEvent): void => {
    const path = fabric.util.object.clone(e.path);
    this.baseCanvas.remove(e.path);
    const objects = this.baseCanvas
      .getObjects()
      .filter((object) => object.intersectsWithObject(path));
    if (!objects.length) return;
    this.baseCanvas.remove(...objects);
    this.history.remove(objects);
  };

  setBrush = (
    brush: fabric.BaseBrush,
    options: GuaranteedIObjectOptions
  ): void => {
    brush.color = "#ff005455";
    brush.strokeDashArray = [0, 0];
    brush.width = 5 * options.strokeWidth;
  };

  /**
   * Execute cut() which attempts to cut currently selected objects if they exist.
   * If cut() true then abort; leave current tool active.
   * Otherwise, mark internal state as active and return true
   *
   * @return Whether it was able to successfully activate
   */
  activate = (): boolean => !this.clipboard.cut() && this.setActive(true);
}

export class LaserHandler extends BrushHandler {
  pathCreated = (e: PathEvent): void => {
    setTimeout(() => {
      this.baseCanvas.remove(e.path);
      this.baseCanvas.requestRenderAll();
    }, 1000);
  };
  setBrush = (
    brush: fabric.BaseBrush,
    options: GuaranteedIObjectOptions
  ): void => {
    brush.color = "#f23523";
    brush.strokeDashArray = [0, 0];
    brush.width = options.strokeWidth;
  };
}

export class LineHandler extends DrawingToolHandler {
  x = 0;
  y = 0;

  dirs: number[][] = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
  ];

  draw = (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): fabric.Line => {
    this.x = x;
    this.y = y;

    return new fabric.Line([x, y, x2, y2] as number[], {
      ...options,
      perPixelTargetFind: true,
    });
  };

  resize = (
    object: fabric.Object,
    x2: number,
    y2: number,
    strict: boolean
  ): fabric.Line => {
    AssertType<fabric.Line>(object);

    const [, x, y] = strict
      ? Behaviors.rectify(this.dirs, this.x, this.y, x2, y2)
      : [undefined, x2, y2];
    object.set({ x2: x, y2: y }).setCoords();
    return object;
  };
}

export class RectangleHandler extends DrawingToolHandler {
  x = 0;
  y = 0;

  dirs: number[][] = [
    [1, 1],
    [-1, 1],
  ];

  draw = (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): fabric.Rect => {
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
    const [, x, y] = strict
      ? Behaviors.rectify(this.dirs, this.x, this.y, x2, y2)
      : [undefined, x2, y2];
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
  x = 0;
  y = 0;

  dirs: number[][] = [
    [1, 1],
    [-1, 1],
  ];

  draw = (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): fabric.Ellipse => {
    this.x = x;
    this.y = y;

    return new fabric.Ellipse({ ...options, left: x, top: y, rx: x2, ry: y2 });
  };

  resize = (
    object: fabric.Object,
    x2: number,
    y2: number,
    strict: boolean
  ): fabric.Ellipse => {
    AssertType<fabric.Ellipse>(object);

    const [, x, y] = strict
      ? Behaviors.rectify(this.dirs, this.x, this.y, x2, y2)
      : [undefined, x2, y2];
    object
      .set({
        originX: this.x > x ? "right" : "left",
        originY: this.y > y ? "bottom" : "top",
        rx: Math.abs(x - (object.left || 0)) / 2,
        ry: Math.abs(y - (object.top || 0)) / 2,
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
  ): {
    Line: LineHandler;
    Ellipse: EllipseHandler;
    Move: MoveHandler;
    Laser: LaserHandler;
    Pen: PenHandler;
    Rectangle: RectangleHandler;
    Eraser: EraserHandler;
  } => ({
    Move: new MoveHandler(baseCanvas, history, clipboard),
    Pen: new PenHandler(baseCanvas, history, clipboard),
    Eraser: new EraserHandler(baseCanvas, history, clipboard),
    Laser: new LaserHandler(baseCanvas, history, clipboard),
    Line: new LineHandler(baseCanvas, history, clipboard),
    Rectangle: new RectangleHandler(baseCanvas, history, clipboard),
    Ellipse: new EllipseHandler(baseCanvas, history, clipboard),
  });
}
