import { fabric } from "fabric";

export type FabricObject = fabric.Object & {
  _objects: FabricObject[]; // not sure this is necessary
};
export type FabricIEvent = fabric.IEvent & {
  selected: FabricObject[];
  target: FabricObject;
};

// don't know whether this is fabric.Path
type PathType = FabricObject & {
  id: number;
}

export type PathEvent = FabricIEvent & {
  path: PathType;
};
