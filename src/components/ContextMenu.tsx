import React, { useEffect, useState } from "react";

import { Style } from "../lib/styles";
import { Action } from "../lib/action";

import StyleMenu from "./StyleMenu";

const ContextMenu = (props: { doAction: (Action) => Promise<void> }) => {
  const [coords, setCoords] = useState<null | [Number, Number]>(null);

  useEffect(() => {
    document.addEventListener("contextmenu", (e: MouseEvent) => {
      e.preventDefault();
      setCoords((coords) => (coords ? null : [e.clientX, e.clientY]));
    });
    document.addEventListener("click", (e) => setCoords(null));
  }, []);

  return coords ? (
    <div
      className="context-menu"
      style={{
        top: `calc(${coords[1]}px - 2.5em)`,
        left: `calc(${coords[0]}px - 4em)`,
      }}
    >
      <StyleMenu
        doAction={(action: Action) => {
          setCoords(null);
          return props.doAction(action);
        }}
      />
    </div>
  ) : null;
};

export default ContextMenu;
