import React, { useEffect, useState } from "react";

import { Style } from "../lib/styles";
import { Action } from "../lib/action";

import StyleMenu from "./StyleMenu";

const ContextMenu = (props: {
  doAction: (Action) => Promise<void>;
}) => {
  const [coords, setCoords] = useState<null | [Number, Number]>(null);

  useEffect(() => {
    document.addEventListener("contextmenu", (e: MouseEvent) => {
      e.preventDefault();
      setCoords([e.clientX, e.clientY]);
    });
  }, []);

  return coords ? (
    <div
      className="contextMenu"
      style={{
        position: "absolute",
        top: `${coords[1]}px`,
        left: `${coords[0]}px`,
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
