import React from "react";

import { Stroke } from "../lib/styles";

const fasIcon = (iconName: string, style?: any) => (
  <i className={`fas fa-${iconName}`} style={style} />
);

const Icon = {
  previousPage: fasIcon("caret-left"),
  nextPage: fasIcon("caret-right"),
  addPage: fasIcon("plus", { transform: "scale(0.7)" }),

  undo: fasIcon("undo"),
  redo: fasIcon("redo"),

  move: fasIcon("mouse-pointer"),
  pen: fasIcon("pen"),
  eraser: fasIcon("eraser"),
  laser: fasIcon("asterisk"),
  line: fasIcon("minus", { transform: "rotate(-45deg)" }),
  ellipse: fasIcon("circle"),
  rectangle: fasIcon("square"),

  save: fasIcon("save"),
  cut: fasIcon("cut"),
  copy: fasIcon("copy"),
  paste: fasIcon("paste"),

  duplicate: fasIcon("clone"),

  black: fasIcon("circle", { color: Stroke.Black }),
  blue: fasIcon("circle", { color: Stroke.Blue }),
  green: fasIcon("circle", { color: Stroke.Green }),
  orange: fasIcon("circle", { color: Stroke.Orange }),
  yellow: fasIcon("circle", { color: Stroke.Yellow }),

  dotted: (
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
  ),
  dashed: (
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
  ),
  solid: <i className="far fa-circle"></i>,

  transparent: <i className="far fa-circle"></i>,
  halfFilled: (
    <div style={{ height: "0.7em", marginRight: "1em", position: "relative" }}>
      <i
        className="fas fa-circle"
        style={{ left: "50%", opacity: 0.3, position: "absolute", top: 0 }}
      />
      <i
        className="far fa-circle"
        style={{ left: "50%", position: "absolute", top: 0 }}
      />
    </div>
  ),
  filled: fasIcon("circle"),

  resetStyles: null,
};

export default Icon;
