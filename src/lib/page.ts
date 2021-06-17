import { fabric } from "fabric";
import AssertType from "../types/assert";
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
  getObjectByIds = (ids: readonly number[]): fabric.Object[] =>
    this.getObjects().filter((object) => ids.includes((object as ObjectId).id));

  serialize = (objects: readonly fabric.Object[]): fabric.Object[] => {
    const selection = this.getActiveObjects();
    const reselect =
      selection.length > 1 && objects.some((obj) => selection.includes(obj));
    if (reselect) {
      this.discardActiveObject();
      this.setActiveObject(
        new fabric.ActiveSelection(selection, { canvas: this })
      );
    }
    return objects.map((obj) =>
      // This is needed for selection groups to be serialized properly.
      // If directly using `obj.toObject` it somehow depends on the selection remaining active,
      // as claimed in <https://github.com/fabricjs/fabric.js/blob/2eabc92a3221dd628576b1bb029a5dc1156bdc06/src/canvas.class.js#L1262-L1272>.
      //
      // We tried using that method in b9cb04c3dacd951785ce4e94ce0c629c09319ec3 but this caused issue #171.
      // See https://github.com/cjquines/qboard/issues/171
      // and https://github.com/cjquines/qboard/issues/176
      // for more details.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)._toObject(obj, "toObject", ["data", "strokeUniform"])
    );
  };

  apply = (
    ids: readonly number[],
    newObjects: fabric.Object[] | null
  ): void => {
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

  /**
   * Create a Fabric Image from {@param imageURL},
   * placed at the location defined by {@param cursor},
   * with custom options given by {@param options}.
   *
   * @warn Make sure that {@param options} does not contain enough properties to satisfy {@link isFabricCollection}
   */
  addImage = async <T extends fabric.IImageOptions>(
    imageURL: string,
    cursor?: Partial<Cursor>,
    options?: T
  ): Promise<fabric.Image & (typeof options extends undefined ? unknown : T)> =>
    new Promise((resolve) =>
      fabric.Image.fromURL(
        imageURL,
        (obj) => {
          AssertType<typeof options extends undefined ? unknown : T>(obj);
          // We are confident that we don't need this return value because we should get the original image back
          // Technically not true because `options` might be so large that it makes `obj` pass `isFabricCollection`
          // so we just warn against it
          this.placeObject(obj, cursor);
          resolve(obj);
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
