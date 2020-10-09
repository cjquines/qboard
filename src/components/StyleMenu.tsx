import React from "react";

import { Dash, Stroke, Fill, Style } from "../lib/styles";
import { Action } from "../lib/action";

import Icon from "./Icon";
import OverlayButton from "./OverlayButton";

const DashStyle = (props: {
  dashStyle: Dash;
  callback: (Action) => Promise<void>;
  inContext: Boolean;
}) => {
  const dashes = [Action.Solid, Action.Dashed, Action.Dotted];

  return (
    <div className="style">
      {!props.inContext && (
        <button className="inactive">{Icon[dashes[props.dashStyle]]}</button>
      )}
      <div className="substyle">
        {dashes.map((action, i) => (
          <OverlayButton
            action={action}
            className={props.inContext && props.dashStyle === i && "active"}
            callback={props.callback}
            key={action}
          />
        ))}
      </div>
    </div>
  );
};

const StrokeStyle = (props: {
  strokeStyle: string;
  callback: (Action) => Promise<void>;
  inContext: Boolean;
}) => {
  const strokes = [
    Action.Black,
    Action.Blue,
    Action.Green,
    Action.Yellow,
    Action.Orange,
  ];
  const strokeMap = [
    Stroke.Black,
    Stroke.Blue,
    Stroke.Green,
    Stroke.Yellow,
    Stroke.Orange,
  ];

  return (
    <div className="style">
      {!props.inContext && (
        <button className="inactive">
          <i className="fas fa-circle" style={{ color: props.strokeStyle }} />
        </button>
      )}
      <div className="substyle">
        {strokes.map((action, i) => (
          <OverlayButton
            action={action}
            className={
              props.inContext && props.strokeStyle === strokeMap[i] && "active"
            }
            callback={props.callback}
            key={action}
          />
        ))}
      </div>
    </div>
  );
};

const FillStyle = (props: {
  fillStyle: Fill;
  callback: (Action) => Promise<void>;
  inContext: Boolean;
}) => {
  const fills = [Action.Transparent, Action.Filled, Action.HalfFilled];

  return (
    <div className="style">
      {!props.inContext && (
        <button className="inactive">{Icon[fills[props.fillStyle]]}</button>
      )}
      <div className="substyle">
        {fills.map((action, i) => (
          <OverlayButton
            action={action}
            className={props.inContext && props.fillStyle === i && "active"}
            callback={props.callback}
            key={action}
          />
        ))}
      </div>
    </div>
  );
};

const StyleMenu = (props: {
  currentStyle: Style;
  doAction: (Action) => Promise<void>;
  inContext?: Boolean;
}) => {
  return (
    <>
      <DashStyle
        dashStyle={props.currentStyle ? props.currentStyle.dash : null}
        callback={props.doAction}
        inContext={props.inContext}
      />
      <StrokeStyle
        strokeStyle={props.currentStyle ? props.currentStyle.stroke : null}
        callback={props.doAction}
        inContext={props.inContext}
      />
      <FillStyle
        fillStyle={props.currentStyle ? props.currentStyle.fill : null}
        callback={props.doAction}
        inContext={props.inContext}
      />
    </>
  );
};

export default StyleMenu;
