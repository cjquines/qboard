import React from "react";

import { Dash, Stroke, Fill, Style } from "./styles";
import { Action } from "./action";

import { Visibility } from "./Overlay";
import Icon from "./Icon";
import OverlayButton from "./OverlayButton";

const DashStyle = (props: {
  dashStyle: Dash;
  callback: (Action) => Promise<void>;
}) => {
  const dashes = [Action.Solid, Action.Dashed, Action.Dotted];

  return (
    <div className="style">
      <button className="inactive">{Icon[dashes[props.dashStyle]]}</button>
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
  strokeStyle: string;
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
      <button className="inactive">
        <i className="fas fa-circle" style={{ color: props.strokeStyle }} />
      </button>
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
  fillStyle: Fill;
  callback: (Action) => Promise<void>;
}) => {
  const fills = [Action.Transparent, Action.Filled, Action.HalfFilled];

  return (
    <div className="style">
      <button className="inactive">{Icon[fills[props.fillStyle]]}</button>
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

const Stylebar = (props: {
  currentStyle: Style;
  doAction: (Action) => Promise<void>;
  visibility: Visibility;
}) => {
  const actions = [Action.Save, Action.Copy, Action.Paste];

  return (
    <div className={`stylebar visibility-${props.visibility}`}>
      {actions.map((action) => (
        <OverlayButton action={action} callback={props.doAction} key={action} />
      ))}
      <DashStyle
        dashStyle={props.currentStyle.dash}
        callback={props.doAction}
      />
      <StrokeStyle
        strokeStyle={props.currentStyle.stroke}
        callback={props.doAction}
      />
      <FillStyle
        fillStyle={props.currentStyle.fill}
        callback={props.doAction}
      />
    </div>
  );
};

export default Stylebar;
