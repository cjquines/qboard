import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#Overlay");

import { Action, actionName } from "../lib/action";
import { mirror } from "../lib/keyboard";

import Icon from "./Icon";
import BindingModal from "./BindingModal";

const HeaderKey = (props: {
  letter: string;
  label?: string;
  width: string;
  leftHanded: boolean;
}) => {
  return (
    <div className="key" style={{ width: props.width }}>
      <span className="letter">
        {props.leftHanded ? mirror(props.letter) : props.letter}
      </span>
      <div className="action">
        <span className="unassigned">{props.label || ""}</span>
      </div>
    </div>
  );
};

const Key = (props: {
  letter: string;
  action?: Action;
  callback: (string) => void;
  leftHanded: boolean;
}) => {
  return (
    <button className="key" onClick={(e) => props.callback(props.letter)}>
      <div className="action">
        {props.action && Icon[props.action]}
        <span className={props.action ? undefined : "unassigned"}>
          {actionName(props.action) || "none"}
        </span>
      </div>
      <span className="letter">
        {props.leftHanded ? mirror(props.letter) : props.letter}
      </span>
    </button>
  );
};

const Bindings = (props: {
  bind: (string, Action) => void;
  unbind: (string) => void;
  keyMap: any;
  modifier: string;
  leftHanded: boolean;
}) => {
  const [bindingModalKeys, setBindingModalKeys] = useState("");
  const [bindingModalAction, setBindingModalAction] = useState(undefined);

  const rows = [
    {
      header: (
        <HeaderKey
          letter="tab"
          label="Hide Toolbar"
          width="4.5em"
          leftHanded={props.leftHanded}
        />
      ),
      letters: "qwert".split(""),
    },
    {
      header: (
        <HeaderKey
          letter="esc"
          label="Deselect"
          width="6em"
          leftHanded={props.leftHanded}
        />
      ),
      letters: "asdfg".split(""),
    },
    {
      header: (
        <HeaderKey
          letter="shift"
          label="Snap"
          width="7.5em"
          leftHanded={props.leftHanded}
        />
      ),
      letters: "zxcvb".split(""),
    },
  ];

  const getModified = (letter: string) => {
    return props.modifier === "" ? letter : `${props.modifier} + ${letter}`;
  };

  const keyHandler = (letter: string) => {
    setBindingModalKeys(getModified(letter));
    setBindingModalAction(props.keyMap[getModified(letter)]);
  };

  return (
    <>
      <div className="bindings">
        {rows.map(({ header, letters }, index) => (
          <div className={`row ${props.leftHanded ? "left" : ""}`} key={index}>
            {!props.leftHanded && header}
            {(props.leftHanded ? letters.reverse() : letters).map((letter) => (
              <Key
                letter={letter}
                action={props.keyMap[getModified(letter)]}
                callback={keyHandler}
                leftHanded={props.leftHanded}
              />
            ))}
            {props.leftHanded && header}
          </div>
        ))}
      </div>
      <BindingModal
        letter={bindingModalKeys}
        action={bindingModalAction}
        close={() => setBindingModalKeys("")}
        callback={(action) => {
          props.unbind(bindingModalKeys);
          if (action) props.bind(bindingModalKeys, action);
          setBindingModalKeys("");
        }}
      />
    </>
  );
};

export default Bindings;
