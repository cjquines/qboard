import React, { useState } from "react";
import { Action, actionName } from "../lib/action";
import Icon from "./Icon";

/**
 * For keys whose bounding behavior cannot be changed;
 * these keys are already mapped to certain app events,
 * so the key diagram in the UI should not be a button.
 *
 * Use if it is meaningful to indicate the app behavior of this key.
 */
export const UnbindableKey = ({
  label = "",
  letter,
  width,
}: {
  letter: string;
  label?: string;
  width?: string;
}) => {
  return (
    <div className="key" style={{ width: width }}>
      <span className="letter">{letter}</span>
      <div className="action">
        <span className="unassigned">{label}</span>
      </div>
    </div>
  );
};

export const Key = (props: {
  letter: string;
  action?: Action;
  onclick: (key: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  width?: string;
}) => {
  return (
    <button
      className="key"
      onClick={(event) => props.onclick(props.letter, event)}
      style={{ width: props.width }}
    >
      <div className="action">
        {props.action && Icon[props.action]}
        <span className={props.action === undefined ? "unassigned" : undefined}>
          {props.action === undefined ? "none" : actionName(props.action)}
        </span>
      </div>
      <span className="letter">{props.letter}</span>
    </button>
  );
};
