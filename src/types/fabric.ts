import { fabric } from "fabric";

export type GuaranteedIObjectOptions = fabric.IObjectOptions & {
  fill: string;
  stroke: string;
  strokeWidth: number;
  selectable: boolean;
  strokeDashArray: number[];
  strokeUniform: boolean;
};

export interface ObjectId extends fabric.Object {
  id: number;
}

export interface FabricObject extends fabric.Object {
  // not sure this is necessary
  _objects: FabricObject[];
  clone(callback: (obj: this) => unknown, propertiesToInclude?: string[]): void;
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
