import React from "react";

import { Action } from "./action";

import { Visibility } from "./Overlay";
import Icon from "./Icon";

const nameMap = {
  previousPage: "–Page",
  nextPage: "+Page",
  resetStyles: "Reset Styles",
  eraser: "Cut / Eraser",
  halfFilled: "Half Fill",
  transparent: "Unfilled",
  rectangle: "Rect.",
  selectAll: "Select All",
  duplicate: "Clone",
};

const HeaderKey = (props: {
  letter: string;
  label?: string;
  width: string;
}) => {
  return (
    <div className="key" style={{ width: props.width }}>
      <span className="letter">{props.letter}</span>
      <div className="action">
        <span className="unassigned">{props.label || ""}</span>
      </div>
    </div>
  );
};

const Key = (props: { letter: string; action?: Action }) => {
  return (
    <div className="key">
      <span className="letter">{props.letter}</span>
      <div className="action">
        {props.action && Icon[props.action]}
        <span className={props.action ? undefined : "unassigned"}>
          {nameMap[props.action] || props.action || "none"}
        </span>
      </div>
    </div>
  );
};

const Bindings = (props: {
  keyMap: any;
  visibility: Visibility;
  modifier: string;
}) => {
  const rows = [
    {
      header: <HeaderKey letter="tab" label="Hide Toolbar" width="5em" />,
      letters: "qwert",
    },
    {
      header: <HeaderKey letter="esc" label="Deselect" width="6.5em" />,
      letters: "asdfg",
    },
    {
      header: <HeaderKey letter="shift" label="Snap" width="8em" />,
      letters: "zxcvb",
    },
  ];

  const getAction = (letter: string) => {
    return props.modifier === ""
      ? props.keyMap[letter]
      : props.keyMap[`${props.modifier} + ${letter}`];
  };

  return (
    <div className={`bindings visibility-${props.visibility}`}>
      {rows.map(({ header, letters }, index) => (
        <div className="row" key={index}>
          {header}
          {letters.split("").map((letter) => (
            <Key letter={letter} action={getAction(letter)} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Bindings;
