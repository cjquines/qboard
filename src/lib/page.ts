import { fabric } from "fabric";

export interface ObjectId extends fabric.Object {
  id: number;
}

export type Cursor = { x: number; y: number };

export default class Page extends fabric.Canvas {
  cursor: Cursor;
  canvasWidth: number;
  canvasHeight: number;
  latestId = 0;
  modified = false;

  fitToWindow = (canvasWidth: number, canvasHeight: number): void => {
    const widthRatio = window.innerWidth / canvasWidth;
    const heightRatio = window.innerHeight / canvasHeight;
    this.setZoom(Math.min(widthRatio, heightRatio));
    this.setWidth(canvasWidth * this.getZoom());
    this.setHeight(canvasHeight * this.getZoom());
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  };

  deactivateSelection = (): void => {
    this.isDrawingMode = false;
    this.selection = false;
    this.discardActiveObject();
    this.forEachObject((object) => {
      object.selectable = false;
    });
    this.requestRenderAll();
  };

  activateSelection = (): void => {
    this.isDrawingMode = false;
    this.selection = true;
    this.forEachObject((object) => {
      object.selectable = true;
    });
  };

  getNextId = (): number => {
    this.latestId += 1;
    return this.latestId;
  };

  // kind of inefficient
  getObjectByIds = (ids: number[]): fabric.Object[] =>
    this.getObjects().filter((object) => ids.includes((object as ObjectId).id));

  serialize = (objects: fabric.Object[]): fabric.Object[] => {
    const selection = this.getActiveObjects();
    const reselect =
      selection.length > 1 && objects.some((obj) => selection.includes(obj));
    if (reselect) {
      this.discardActiveObject();
      this.setActiveObject(
        new fabric.ActiveSelection(selection, { canvas: this })
      );
    }
    return objects.map((obj) => obj.toObject(["strokeUniform"]));
  };

  apply = (ids: number[], newObjects: fabric.Object[] | null): void => {
    const oldObjects = this.getObjectByIds(ids);
    if (oldObjects.length) {
      this.remove(...oldObjects);
    }
    if (newObjects?.length) {
      const addObjects = (objects) => {
        objects.forEach((object: ObjectId, i) => {
          object.id = ids[i];
        });
        this.add(...objects);
        this.requestRenderAll();
      };
      fabric.util.enlivenObjects(newObjects, addObjects, "fabric");
    } else {
      this.requestRenderAll();
    }
  };

  loadFromJSONAsync = async (json: unknown): Promise<void> =>
    new Promise<void>((resolve) => {
      super.loadFromJSON(json, () => {
        resolve();
      });
    });

  placeObject<T extends fabric.Object>(
    obj: T,
    cursor: Cursor = this.cursor
  ): T {
    const { x = this.canvasWidth / 2, y = this.canvasHeight / 2 } =
      cursor || {};
    this.discardActiveObject();
    const id = this.getNextId();

    obj.set(({
      id,
      left: x,
      top: y,
      originX: "center",
      originY: "center",
    } as Partial<fabric.Object>) as Partial<T>);
    this.add(obj);
    this.setActiveObject(obj);
    this.requestRenderAll();
    return obj;
  }
}
