import React from "react";
import ReactTooltip from "react-tooltip";

import { Action, actionName } from "../lib/action";

import Icon from "./Icon";

const OverlayButton = (props: {
  action: Action;
  callback: (action: Action) => void;
  className?: string;
}): JSX.Element => {
  return (
    <>
      <button
        className={props.className}
        data-tip
        data-for={props.action}
        onClick={() => props.callback(props.action)}
      >
        {Icon[props.action]}
      </button>
      <ReactTooltip
        backgroundColor="#ddd"
        effect="solid"
        id={props.action}
        place="right"
        textColor="#262626"
      >
        {actionName(props.action)}
      </ReactTooltip>
    </>
  );
};

export default OverlayButton;
