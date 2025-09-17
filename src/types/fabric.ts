import * as fabric from "fabric";

export type GuaranteedIObjectOptions = Partial<fabric.FabricObjectProps> & {
  fill: string;
  stroke: string;
  strokeWidth: number;
  selectable: boolean;
  strokeDashArray: number[];
  strokeUniform: boolean;
};

export interface ObjectId extends fabric.FabricObject {
  id?: number;
  idVersion?: 1;
}

export type FabricIEvent = fabric.TEvent & {
  selected: fabric.FabricObject[];
  target: fabric.FabricObject;
};

// don't know whether this is fabric.Path
type PathType = fabric.FabricObject & {
  id: number;
};

export type PathEvent = FabricIEvent & {
  path: PathType;
};

export function isFabricCollection(
  obj: fabric.FabricObject,
): obj is fabric.FabricObject & (fabric.Group | fabric.ActiveSelection) {
  return Array.isArray((obj as fabric.Group)._objects);
}

export interface FabricTeXImage extends fabric.Image {
  data: {
    texSource: string;
  };
}

export function isFabricTeXImage(image: fabric.Image): image is FabricTeXImage {
  return typeof (image as FabricTeXImage)?.data?.texSource === "string";
}
