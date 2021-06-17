import { fabric } from "fabric";

export type GuaranteedIObjectOptions = fabric.IObjectOptions & {
  fill: string;
  stroke: string;
  strokeWidth: number;
  selectable: boolean;
  strokeDashArray: number[];
  strokeUniform: boolean;
};

export interface FabricObject extends fabric.Object {
  clone(callback: (obj: this) => unknown, propertiesToInclude?: string[]): void;
}

export interface ObjectId extends FabricObject {
  id: number;
}

export type FabricIEvent = fabric.IEvent & {
  selected: FabricObject[];
  target: FabricObject;
};

// don't know whether this is fabric.Path
type PathType = FabricObject & {
  id: number;
};

export type PathEvent = FabricIEvent & {
  path: PathType;
};

export function isFabricCollection(
  obj: fabric.Object
): obj is fabric.Object & fabric.ICollection<unknown> {
  return "_objects" in obj;
}

export interface FabricTeXImage extends fabric.Image {
  data: {
    texSource: string;
  };
}

export function isFabricTeXImage(image: fabric.Image): image is FabricTeXImage {
  return typeof image?.data?.texSource === "string";
}
