import React from "react";

import { Dash, Stroke, Fill, Style } from "../lib/styles";
import { Action } from "../lib/action";

import Icon from "./Icon";
import ButtonRow from "./ButtonRow";

const DashStyle = (props: {
  dashStyle: Dash;
  callback: (action: Action) => Promise<void>;
  inContext: Boolean;
}) => {
  const dashes = [Action.Solid, Action.Dashed, Action.Dotted];
  const button = (
    <button className="inactive">{Icon[dashes[props.dashStyle]]}</button>
  );

  return (
    <ButtonRow
      actions={dashes}
      className={(action, i) =>
        props.inContext && props.dashStyle === i && "active"
      }
      callback={props.callback}
      outerButton={!props.inContext && button}
    />
  );
};

const StrokeStyle = (props: {
  strokeStyle: string;
  callback: (action: Action) => Promise<void>;
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
  const button = (
    <button className="inactive">
      <i className="fas fa-circle" style={{ color: props.strokeStyle }} />
    </button>
  );

  return (
    <ButtonRow
      actions={strokes}
      className={(action, i) =>
        props.inContext && props.strokeStyle === strokeMap[i] && "active"
      }
      callback={props.callback}
      outerButton={!props.inContext && button}
    />
  );
};

const FillStyle = (props: {
  fillStyle: Fill;
  callback: (action: Action) => Promise<void>;
  inContext: Boolean;
}) => {
  const fills = [Action.Transparent, Action.Filled, Action.HalfFilled];
  const button = (
    <button className="inactive">{Icon[fills[props.fillStyle]]}</button>
  );

  return (
    <ButtonRow
      actions={fills}
      className={(action, i) =>
        props.inContext && props.fillStyle === i && "active"
      }
      callback={props.callback}
      outerButton={!props.inContext && button}
    />
  );
};

const StyleMenu = (props: {
  currentStyle: Style;
  doAction: (action: Action) => Promise<void>;
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
