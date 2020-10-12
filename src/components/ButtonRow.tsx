import React, { ReactNode } from "react";

import { Action } from "../lib/action";

import OverlayButton from "./OverlayButton";

const ButtonRow = (props: {
  actions: Action[];
  className: (Action, number?) => null | string;
  callback: (Action) => Promise<void>;
  outerButton?: boolean | ReactNode;
}) => {
  return (
    <div className={`button-row ${props.outerButton && "button-row-hover"}`}>
      {props.outerButton}
      <div className="button-row-inner">
        {props.actions.map((action, i) => (
          <OverlayButton
            action={action}
            className={props.className(action, i) || null}
            callback={props.callback}
            key={action}
          />
        ))}
      </div>
    </div>
  );
};

export default ButtonRow;
