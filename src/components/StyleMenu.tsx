import { Dash, Fill, Stroke, Style } from "../lib/styles";
import { Action } from "../lib/action";

import Icon from "./Icon";
import ButtonRow from "./ButtonRow";

type StyleOptions = {
  callback: (action: Action) => void;
  inContext?: boolean;
};

const DashStyle = ({
  dashStyle,
  callback,
  inContext = false,
}: StyleOptions & { dashStyle: Dash }) => {
  const dashes = [Action.Solid, Action.Dashed, Action.Dotted];
  const button = (
    <button className="inactive">{Icon[dashes[dashStyle]]}</button>
  );

  return (
    <ButtonRow
      actions={dashes}
      className={(action, i) => {
        if (inContext && dashStyle === i) return "active";
      }}
      callback={callback}
      outerButton={!inContext && button}
    />
  );
};

const StrokeStyle = ({
  strokeStyle,
  callback,
  inContext = false,
}: StyleOptions & {
  strokeStyle: string;
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
      <i className="fas fa-circle" style={{ color: strokeStyle }} />
    </button>
  );

  return (
    <ButtonRow
      actions={strokes}
      className={(action, i) => {
        if (inContext && strokeStyle === strokeMap[i]) return "active";
      }}
      callback={callback}
      outerButton={!inContext && button}
    />
  );
};

const FillStyle = ({
  fillStyle,
  callback,
  inContext = false,
}: StyleOptions & {
  fillStyle: Fill;
}) => {
  const fills = [Action.Transparent, Action.Filled, Action.HalfFilled];
  const button = <button className="inactive">{Icon[fills[fillStyle]]}</button>;

  return (
    <ButtonRow
      actions={fills}
      className={(action, i) => {
        if (inContext && fillStyle === i) return "active";
      }}
      callback={callback}
      outerButton={!inContext && button}
    />
  );
};

const StyleMenu = (props: {
  currentStyle: Style;
  doAction: (action: Action) => void;
  inContext?: boolean;
}) => {
  return (
    <>
      <DashStyle
        dashStyle={props.currentStyle.dash}
        callback={props.doAction}
        inContext={props.inContext}
      />
      <StrokeStyle
        strokeStyle={props.currentStyle.stroke}
        callback={props.doAction}
        inContext={props.inContext}
      />
      <FillStyle
        fillStyle={props.currentStyle.fill}
        callback={props.doAction}
        inContext={props.inContext}
      />
    </>
  );
};

export default StyleMenu;
