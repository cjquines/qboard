import React from "react";

import { Dash, Stroke, Fill } from "./styles";
import { Visibility } from "./Overlay";

const dashed = (
  <svg viewBox="0 0 21 21" style={{ width: "1em", height: "1.1em" }}>
    <g transform="translate(-90 -1158)">
      <g>
        <path d="M101,1176.92v2.021c1.735-0.192,3.319-0.878,4.613-1.913l-1.43-1.43C103.269,1176.284,102.183,1176.75,101,1176.92z" />
        <path d="M93.08,1171h-2.021c0.191,1.735,0.879,3.319,1.914,4.614l1.43-1.43C93.716,1173.269,93.25,1172.183,93.08,1171z" />
        <path d="M104.184,1164.401l1.43-1.43c-1.294-1.035-2.878-1.721-4.613-1.913v2.021    C102.184,1163.25,103.27,1163.716,104.184,1164.401z" />
        <path d="M106.92,1169h2.021c-0.191-1.735-0.879-3.319-1.914-4.614l-1.43,1.43C106.284,1166.731,106.75,1167.817,106.92,1169z" />
        <path d="M95.816,1175.599l-1.43,1.43c1.294,1.035,2.878,1.721,4.613,1.913v-2.021C97.816,1176.75,96.73,1176.284,95.816,1175.599z" />
        <path d="M94.401,1165.815l-1.429-1.43c-1.036,1.295-1.723,2.879-1.914,4.614h2.021    C93.25,1167.817,93.716,1166.731,94.401,1165.815z" />
        <path d="M99,1163.08v-2.021c-1.735,0.192-3.319,0.878-4.613,1.913l1.43,1.43C96.731,1163.716,97.817,1163.25,99,1163.08z" />
        <path d="M106.92,1171c-0.17,1.183-0.636,2.269-1.322,3.185l1.43,1.43c1.036-1.295,1.723-2.879,1.914-4.614H106.92z" />
      </g>
    </g>
  </svg>
);

const dotted = (
  <svg viewBox="0 0 21 21" style={{ width: "1em", height: "1.1em" }}>
    <g transform="translate(-90 -1158)">
      <g>
        <path d="M104.184,1164.401l1.43-1.43c-1.294-1.035-2.878-1.721-4.613-1.913v2.021    C102.184,1163.25,103.27,1163.716,104.184,1164.401z" />
        <path d="M95.816,1175.599l-1.43,1.43c1.294,1.035,2.878,1.721,4.613,1.913v-2.021C97.816,1176.75,96.73,1176.284,95.816,1175.599z" />
        <path d="M94.401,1165.815l-1.429-1.43c-1.036,1.295-1.723,2.879-1.914,4.614h2.021    C93.25,1167.817,93.716,1166.731,94.401,1165.815z" />
        <path d="M106.92,1171c-0.17,1.183-0.636,2.269-1.322,3.185l1.43,1.43c1.036-1.295,1.723-2.879,1.914-4.614H106.92z" />
      </g>
    </g>
  </svg>
);

const halfSolid = (
  <div style={{ width: "1em", height: "0.75em", position: "relative" }}>
    <i
      className="fas fa-circle"
      style={{ left: 0, opacity: 0.3, position: "absolute", top: 0 }}
    />
    <i
      className="far fa-circle"
      style={{ left: 0, position: "absolute", top: 0 }}
    />
  </div>
);

const DashStyle = (props: { dashStyle: Dash; callback: (Dash) => void }) => {
  const dashOptions = [
    {
      option: Dash.Solid,
      icon: <i className="far fa-circle"></i>,
    },
    {
      option: Dash.Dashed,
      icon: dashed,
    },
    {
      option: Dash.Dotted,
      icon: dotted,
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
      icon: <i className="far fa-circle"></i>,
    },
    {
      option: Fill.Solid,
      icon: <i className="fas fa-circle"></i>,
    },
    {
      option: Fill.HalfSolid,
      icon: halfSolid,
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
  dashStyle: Dash;
  strokeStyle: string;
  fillStyle: Fill;
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
        dashStyle={props.dashStyle}
        callback={(dash) => props.setStyle(dash, null, null)}
      />
      <StrokeStyle
        strokeStyle={props.strokeStyle}
        callback={(stroke) => props.setStyle(null, stroke, null)}
      />
      <FillStyle
        fillStyle={props.fillStyle}
        callback={(fill) => props.setStyle(null, null, fill)}
      />
    </div>
  );
};

export default Stylebar;
