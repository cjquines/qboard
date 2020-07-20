import React from "react";

import { Dash, Stroke, Fill, Style } from "./styles";
import { Visibility } from "./Overlay";
import Icon from "./Icon";

const DashStyle = (props: { dashStyle: Dash; callback: (Dash) => void }) => {
  const dashOptions = [
    {
      option: Dash.Solid,
      icon: Icon.solid,
    },
    {
      option: Dash.Dashed,
      icon: Icon.dashed,
    },
    {
      option: Dash.Dotted,
      icon: Icon.dotted,
    },
  ];

  return (
    <div className="style">
      <button className="inactive">{dashOptions[props.dashStyle].icon}</button>
      <div className="substyle">
        {dashOptions.map(({ option, icon }) => {
          return (
            <button key={option} onClick={(e) => props.callback(option)}>
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StrokeStyle = (props: {
  strokeStyle: string;
  callback: (Stroke) => void;
}) => {
  const strokes = [
    Stroke.Black,
    Stroke.Blue,
    Stroke.Green,
    Stroke.Yellow,
    Stroke.Orange,
  ];
  const icon = (color: string) => (
    <i className="fas fa-circle" style={{ color }} />
  );

  return (
    <div className="style">
      <button className="inactive">{icon(props.strokeStyle)}</button>
      <div className="substyle">
        {strokes.map((color) => (
          <button key={color} onClick={(e) => props.callback(color)}>
            {icon(color)}
          </button>
        ))}
      </div>
    </div>
  );
};

const FillStyle = (props: { fillStyle: Fill; callback: (Fill) => void }) => {
  const fillOptions = [
    {
      option: Fill.Transparent,
      icon: Icon.transparent,
    },
    {
      option: Fill.Solid,
      icon: Icon.filled,
    },
    {
      option: Fill.HalfSolid,
      icon: Icon.halfFilled,
    },
  ];

  return (
    <div className="style">
      <button className="inactive">{fillOptions[props.fillStyle].icon}</button>
      <div className="substyle">
        {fillOptions.map(({ option, icon }) => {
          return (
            <button key={option} onClick={(e) => props.callback(option)}>
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Stylebar = (props: {
  save: () => Promise<void>;
  copy: () => Promise<void>;
  paste: () => Promise<void>;
  currentStyle: Style;
  setStyle: (
    dash: Dash | null,
    stroke: Stroke | null,
    fill: Fill | null
  ) => void;
  visibility: Visibility;
}) => {
  const actions = [
    {
      act: props.save,
      name: "save",
      icon: "fa-save",
    },
    {
      act: props.copy,
      name: "copy",
      icon: "fa-copy",
    },
    {
      act: props.paste,
      name: "paste",
      icon: "fa-paste",
    },
  ];

  return (
    <div className={`stylebar visibility-${props.visibility}`}>
      {actions.map(({ act, name, icon }) => {
        return (
          <button key={name} onClick={(e) => act()}>
            <i className={`fas ${icon}`} />
          </button>
        );
      })}
      <DashStyle
        dashStyle={props.currentStyle.dash}
        callback={(dash) => props.setStyle(dash, null, null)}
      />
      <StrokeStyle
        strokeStyle={props.currentStyle.stroke}
        callback={(stroke) => props.setStyle(null, stroke, null)}
      />
      <FillStyle
        fillStyle={props.currentStyle.fill}
        callback={(fill) => props.setStyle(null, null, fill)}
      />
    </div>
  );
};

export default Stylebar;
