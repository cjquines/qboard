import React from "react";

import { Dash, Stroke, Fill, Style } from "../lib/styles";
import { Action } from "../lib/action";

import Icon from "./Icon";
import OverlayButton from "./OverlayButton";

const DashStyle = (props: {
  dashStyle: null | Dash;
  callback: (Action) => Promise<void>;
}) => {
  const dashes = [Action.Solid, Action.Dashed, Action.Dotted];

  return (
    <div className="style">
      {props.dashStyle !== null && (
        <button className="inactive">{Icon[dashes[props.dashStyle]]}</button>
      )}
      <div className="substyle">
        {dashes.map((action) => (
          <OverlayButton
            action={action}
            callback={props.callback}
            key={action}
          />
        ))}
      </div>
    </div>
  );
};

const StrokeStyle = (props: {
  strokeStyle: null | string;
  callback: (Action) => Promise<void>;
}) => {
  const strokes = [
    Action.Black,
    Action.Blue,
    Action.Green,
    Action.Yellow,
    Action.Orange,
  ];

  return (
    <div className="style">
      {props.strokeStyle !== null && (
        <button className="inactive">
          <i className="fas fa-circle" style={{ color: props.strokeStyle }} />
        </button>
      )}
      <div className="substyle">
        {strokes.map((action) => (
          <OverlayButton
            action={action}
            callback={props.callback}
            key={action}
          />
        ))}
      </div>
    </div>
  );
};

const FillStyle = (props: {
  fillStyle: null | Fill;
  callback: (Action) => Promise<void>;
}) => {
  const fills = [Action.Transparent, Action.Filled, Action.HalfFilled];

  return (
    <div className="style">
      {props.fillStyle !== null && (
        <button className="inactive">{Icon[fills[props.fillStyle]]}</button>
      )}
      <div className="substyle">
        {fills.map((action) => (
          <OverlayButton
            action={action}
            callback={props.callback}
            key={action}
          />
        ))}
      </div>
    </div>
  );
};

const StyleMenu = (props: {
  currentStyle?: Style;
  doAction: (Action) => Promise<void>;
}) => {
  return (
    <>
      <DashStyle
        dashStyle={props.currentStyle ? props.currentStyle.dash : null}
        callback={props.doAction}
      />
      <StrokeStyle
        strokeStyle={props.currentStyle ? props.currentStyle.stroke : null}
        callback={props.doAction}
      />
      <FillStyle
        fillStyle={props.currentStyle ? props.currentStyle.fill : null}
        callback={props.doAction}
      />
    </>
  );
};

export default StyleMenu;
