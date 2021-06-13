import React, { useRef } from "react";
import { VirtualElementProps } from "./VirtualElement";

const VirtualCanvas = ({
  captureRef,
  ...attrs
}: VirtualElementProps<HTMLCanvasElement> &
  React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  >): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  captureRef?.(canvasRef);

  return <canvas ref={canvasRef} style={{ display: "none" }} {...attrs} />;
};

export default VirtualCanvas;
