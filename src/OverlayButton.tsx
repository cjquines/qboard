import React from "react";

import { Action } from "./action";
import Icon from "./Icon";

const OverlayButton = (props: {
  action: Action;
  callback: (Action) => Promise<void>;
  className?: string;
}) => {
  return (
    <button
      className={props.className || undefined}
      onClick={(e) => props.callback(props.action)}
    >
      {Icon[props.action]}
    </button>
  );
};

export default OverlayButton;
