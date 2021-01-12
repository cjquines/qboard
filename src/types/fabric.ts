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
