import React, { ReactNode } from "react";

import { Action } from "../lib/action";

import OverlayButton from "./OverlayButton";

const ButtonRow = (props: {
  actions: Action[];
  className?: (action: Action, i?: number) => null | string;
  callback: (action: Action) => Promise<void>;
  outerButton?: boolean | ReactNode;
  vertical?: boolean;
}) => {
  return (
    <div
      className={`button-row
        ${props.vertical && "button-row-vertical"}
        ${props.outerButton && "button-row-hover"}`}
    >
      {props.outerButton}
      <div className="button-row-inner">
        {props.actions.map((action, i) => (
          <OverlayButton
            action={action}
            className={props.className && props.className(action, i)}
            callback={props.callback}
            key={action}
          />
        ))}
      </div>
    </div>
  );
};

export default ButtonRow;
