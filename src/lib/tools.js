import { fabric } from "fabric";
import AssertType from "../types/assert";
class Behaviors {
}
// given the origin x, y, snaps the point x2, y2 to the nearest vector in dirs
Behaviors.rectify = (dirs, x, y, x2, y2) => {
    return dirs
        .map((d) => Behaviors.project(x, y, d[0], d[1], x2, y2))
        .reduce((acc, cur) => (acc[0] < cur[0] ? acc : cur));
};
// projects the point x2, y2 to the vector with origin ox, oy and direction vx, vy. returns the square distance and the coordinates of the projection.
Behaviors.project = (ox, oy, vx, vy, x2, y2) => {
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
export class Tool {
    isDrawing() {
        return this._isDrawing;
    }
    requiresBase() {
        return this._requiresBase;
    }
    isBrush() {
        return this._isBrush;
    }
    constructor(baseCanvas, history, clipboard) {
        this.baseCanvas = baseCanvas;
        this.history = history;
        this.clipboard = clipboard;
        // Add type marker `boolean` so it can be overridden; otherwise takes type `false`
        /**
         * Make sure that no extending classes except DrawingTool set this to true;
         * the value of this property is used as a type guard.
         */
        this._isDrawing = false;
        /**
         * Make sure that no extending classes except RequiresBaseTool set this to true;
         * the value of this property is used as a type guard.
         */
        this._requiresBase = false;
        /**
         * Make sure that no extending classes except Brush set this to true;
         * the value of this property is used as a type guard.
         */
        this._isBrush = false;
        /**
         * Set externally from activate() and deactivate().
         * Set internally (from an extending class) with setActive();
         * @private
         */
        this.active = false;
        /**
         * @return Whether the activation was successful.
         * Maybe want to throw error instead of return boolean.
         */
        this.activate = () => this.setActive(true);
        /**
         * Not allowed to fail
         */
        this.deactivate = () => this.setActive(false);
        /**
         * get this.active
         */
        this.isActive = () => this.active;
        /**
         * set this.active active
         */
        this.setActive = (active) => (this.active = active);
    }
}
export class DrawingTool extends Tool {
    constructor() {
        super(...arguments);
        this._isDrawing = true;
    }
}
export class RequiresBase extends Tool {
    constructor() {
        super(...arguments);
        this._requiresBase = true;
    }
}
export class Brush extends RequiresBase {
    constructor() {
        super(...arguments);
        this._isBrush = true;
        /**
         * Handle the pathCreated event
         */
        this.pathCreated = () => { };
        this.setBrush = () => { };
    }
}
export class Move extends RequiresBase {
}
export class Pen extends Brush {
    constructor() {
        super(...arguments);
        this.pathCreated = (e) => {
            this.history.add([e.path]);
        };
        this.setBrush = (brush, options) => {
            brush.color = options.stroke;
            brush.strokeDashArray = options.strokeDashArray;
            brush.width = options.strokeWidth;
        };
    }
}
export class Eraser extends Brush {
    constructor() {
        super(...arguments);
        this.pathCreated = ({ path }) => {
            const objects = this.baseCanvas
                .getObjects()
                .filter((object) => object.intersectsWithObject(path));
            this.baseCanvas.remove(path, ...objects);
            this.history.remove(objects);
        };
        this.setBrush = (brush, options) => {
            brush.color = "#ff005455";
            brush.strokeDashArray = [0, 0];
            brush.width = 5 * options.strokeWidth;
        };
        /**
         * Attempts to activate the current tool
         *
         * Default implementation:
         * Execute cut() which attempts to cut currently selected objects if they exist.
         * If cut() true then abort; leave current tool active.
         * Otherwise, mark internal state as active and return true
         *
         * @return Whether it was able to successfully activate
         */
        this.activate = () => !this.clipboard.cut() && this.setActive(true);
    }
}
export class Laser extends Brush {
    constructor() {
        super(...arguments);
        this.pathCreated = (e) => {
            setTimeout(() => {
                this.baseCanvas.remove(e.path);
                this.baseCanvas.requestRenderAll();
            }, 1000);
        };
        this.setBrush = (brush, options) => {
            brush.color = "#f23523";
            brush.strokeDashArray = [0, 0];
            brush.width = options.strokeWidth;
        };
    }
}
export class Line extends DrawingTool {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.dirs = [
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1],
        ];
        this.draw = (x, y, options, x2, y2) => {
            this.x = x;
            this.y = y;
            return new fabric.Line([x, y, x2, y2], {
                ...options,
                perPixelTargetFind: true,
            });
        };
        this.resize = (object, x2, y2, strict) => {
            AssertType(object);
            const [, x, y] = strict
                ? Behaviors.rectify(this.dirs, this.x, this.y, x2, y2)
                : [undefined, x2, y2];
            object.set({ x2: x, y2: y }).setCoords();
            return object;
        };
    }
}
export class Rectangle extends DrawingTool {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.dirs = [
            [1, 1],
            [-1, 1],
        ];
        this.draw = (x, y, options, x2, y2) => {
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
        this.resize = (object, x2, y2, strict) => {
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
}
export class Ellipse extends DrawingTool {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.dirs = [
            [1, 1],
            [-1, 1],
        ];
        this.draw = (x, y, options, x2, y2) => {
            this.x = x;
            this.y = y;
            return new fabric.Ellipse({ ...options, left: x, top: y, rx: x2, ry: y2 });
        };
        this.resize = (object, x2, y2, strict) => {
            AssertType(object);
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
}
const instantiateTools = (baseCanvas, history, clipboard) => ({
    Move: new Move(baseCanvas, history, clipboard),
    Pen: new Pen(baseCanvas, history, clipboard),
    Eraser: new Eraser(baseCanvas, history, clipboard),
    Laser: new Laser(baseCanvas, history, clipboard),
    Line: new Line(baseCanvas, history, clipboard),
    Rectangle: new Rectangle(baseCanvas, history, clipboard),
    Ellipse: new Ellipse(baseCanvas, history, clipboard),
});
export default instantiateTools;
