import { ReactNode } from "react";

import { Action } from "../lib/action";

import OverlayButton from "./OverlayButton";

const ButtonRow = (props: {
  actions: Action[];
  callback: (action: Action) => void;
  className?: (action: Action, i: number) => undefined | string;
  cName?: string;
  outerButton?: boolean | ReactNode;
}) => {
  return (
    <div
      className={`button-row ${props.cName} ${
        props.outerButton ? "button-row-hover" : ""
      }`}
    >
      {props.outerButton}
      <div className="button-row-inner">
        {props.actions.map((action, i) => (
          <OverlayButton
            action={action}
            className={props.className?.(action, i)}
            callback={props.callback}
            key={action}
          />
        ))}
      </div>
    </div>
  );
};

export default ButtonRow;
