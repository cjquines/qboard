import React, { useEffect, useState } from "react";

import { Style } from "../lib/styles";
import { Action } from "../lib/action";

import StyleMenu from "./StyleMenu";

const ContextMenu = (props: {
  currentStyle: Style;
  doAction: (action: Action) => void;
}): JSX.Element | null => {
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    document.addEventListener("contextmenu", (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains("upper-canvas")) {
        e.preventDefault();
        e.stopPropagation();
        setCoords((oldCoords) => (oldCoords ? null : [e.clientX, e.clientY]));
      }
    });
    document.addEventListener("click", () => setCoords(null));
  }, []);

  return coords ? (
    <div
      className="context-menu"
      style={{
        top: `calc(${coords[1]}px - 2.8em)`,
        left: `calc(${coords[0]}px - 1.1em)`,
      }}
    >
      <StyleMenu
        currentStyle={props.currentStyle}
        doAction={(action: Action) => props.doAction(action)}
        inContext={true}
      />
    </div>
  ) : null;
};

export default ContextMenu;
