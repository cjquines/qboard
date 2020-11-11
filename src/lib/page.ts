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

  fitToWindow = async (
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> => {
    const widthRatio = window.innerWidth / canvasWidth;
    const heightRatio = window.innerHeight / canvasHeight;
    this.setZoom(Math.min(widthRatio, heightRatio));
    this.setWidth(canvasWidth * this.getZoom());
    this.setHeight(canvasHeight * this.getZoom());
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  };

  deactivateSelection = async (): Promise<void> => {
    this.isDrawingMode = false;
    this.selection = false;
    this.discardActiveObject();
    this.forEachObject((object) => {
      object.selectable = false;
    });
    this.requestRenderAll();
  };

  activateSelection = async (): Promise<void> => {
    this.isDrawingMode = false;
    this.selection = true;
    this.forEachObject((object) => {
      object.selectable = true;
    });
  };

  getNextId = async (): Promise<number> => {
    this.latestId += 1;
    return this.latestId;
  };

  getObjectByIds = (ids: number[]): fabric.Object[] => {
    // multiple element case; kind of inefficient
    if (ids.length > 1) {
      return this.getObjects().filter((object: ObjectId) =>
        ids.includes(object.id)
      );
    }
    // single element case
    const [id] = ids;
    for (const object of this.getObjects()) {
      if ((object as ObjectId).id === id) {
        return [object];
      }
    }
    return [];
  };

  serialize = async (objects: fabric.Object[]): Promise<fabric.Object[]> => {
    return objects.map((object) => object.toObject(["strokeUniform"]));
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

  placeObject = async (
    obj: any,
    cursor: Cursor = this.cursor
  ): Promise<fabric.Object[]> => {
    const { x = this.canvasWidth / 2, y = this.canvasHeight / 2 } =
      cursor || {};
    this.discardActiveObject();
    const id = await this.getNextId();

    obj.set({
      id,
      left: x,
      top: y,
      originX: "center",
      originY: "center",
    } as Partial<fabric.ActiveSelection>);
    if (obj._objects) {
      obj.canvas = this;
      obj.forEachObject((object) =>
        this.getNextId().then((id_) => {
          (object as ObjectId).id = id_;
          this.add(object);
        })
      );
      obj.setCoords();
    } else {
      this.add(obj);
    }
    this.setActiveObject(obj);
    this.requestRenderAll();
    return obj._objects || [obj];
  };
}
