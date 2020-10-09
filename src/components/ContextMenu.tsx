import React from "react";

import { Style } from "../lib/styles";
import { Action } from "../lib/action";

import StyleMenu from "./StyleMenu";

const ContextMenu = (props: {
  coords: null | [Number, Number];
  currentStyle: Style;
  doAction: (Action) => Promise<void>;
  toggleOpen: () => void;
}) => {
  return (
    <div
      className="contextMenu"
      style={{
        position: "absolute",
        top: `${props.coords[1]}px`,
        left: `${props.coords[0]}px`,
      }}
    >
      <StyleMenu
        currentStyle={props.currentStyle}
        doAction={(action: Action) => {
          props.toggleOpen();
          return props.doAction(action);
        }}
      />
    </div>
  );
};

export default ContextMenu;
