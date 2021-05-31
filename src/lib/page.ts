import { fabric } from "fabric";
import { FabricObject, isFabricCollection, ObjectId } from "../types/fabric";

export type Cursor = { x: number; y: number };

export default class Page extends fabric.Canvas {
  cursor: Cursor | undefined;

  // assert not undefined because fitToWindow, which is called at init, sets these
  canvasWidth!: number;
  canvasHeight!: number;

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

  addImage = async (
    imageURL: string,
    cursor?: Partial<Cursor>,
    options?: fabric.IImageOptions
  ): Promise<fabric.Image> =>
    new Promise<fabric.Image>((resolve) =>
      fabric.Image.fromURL(
        imageURL,
        (obj) => {
          resolve(this.placeObject(obj, cursor)[0]);
        },
        options
      )
    );

  placeObject = <T extends FabricObject>(
    obj: T,
    {
      x = this.canvasWidth / 2,
      y = this.canvasHeight / 2,
    }: Partial<Cursor> = this.cursor ?? {}
  ): T extends fabric.ICollection<unknown> ? fabric.Object[] : [T] => {
    this.discardActiveObject();
    const id = this.getNextId();

    ((obj as FabricObject) as ObjectId).set({
      id,
      left: x,
      top: y,
      originX: "center",
      originY: "center",
    });

    let returnObjects;

    if (isFabricCollection(obj)) {
      obj.canvas = this;
      obj.forEachObject((object) => {
        (object as ObjectId).id = this.getNextId();
        this.add(object);
      });
      obj.setCoords();

      returnObjects = obj.getObjects();
    } else {
      this.add(obj);

      returnObjects = [obj];
    }
    this.setActiveObject(obj);
    this.requestRenderAll();
    return returnObjects;
  };
}
