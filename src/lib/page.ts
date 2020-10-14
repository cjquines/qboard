import { fabric } from "fabric";

export default class Page extends fabric.Canvas {
  cursor: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
  latestId: number = 0;
  modified: boolean = false;

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
      return this.getObjects().filter((object: any) => ids.includes(object.id));
    }
    // single element case
    const id = ids[0];
    for (let object of this.getObjects()) {
      if ((object as any).id === id) {
        return [object];
      }
    }
    return [];
  };

  serialize = async (objects: fabric.Object[]): Promise<fabric.Object[]> => {
    return objects.map((object) =>
      (this as any)._toObject(object, "toObject", ["strokeUniform"])
    );
  };

  apply = (ids: number[], newObjects: fabric.Object[] | null): void => {
    const oldObjects = this.getObjectByIds(ids);
    if (oldObjects.length) {
      this.remove(...oldObjects);
    }
    if (newObjects?.length) {
      const addObjects = (objects) => {
        objects.forEach((object: any, i) => {
          object.id = ids[i];
        });
        this.add(...objects);
      };
      fabric.util.enlivenObjects(newObjects, addObjects, "fabric");
    }
    this.requestRenderAll();
  };

  loadFromJSONAsync = async (json: any) =>
    new Promise<void>((resolve) => {
      super.loadFromJSON(json, () => {
        resolve();
      });
    });

  placeObject = async (obj: any, cursor: any = this.cursor): Promise<any> => {
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
    });
    if (obj._objects) {
      obj.canvas = this;
      obj.forEachObject((object) => {
        this.getNextId().then((id) => {
          object.id = id;
          this.add(object);
        });
      });
      obj.setCoords();
    } else {
      this.add(obj);
    }
    this.setActiveObject(obj);
    this.requestRenderAll();
    return obj._objects || [obj];
  };
}
