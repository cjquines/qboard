import React, { useState } from "react";
import Modal from "react-modal";

import { Action, actionName } from "../lib/action";
import { KeyMap, mirror } from "../lib/keyboard";

import Icon from "./Icon";
import BindingModal from "./BindingModal";

Modal.setAppElement("#Overlay");

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
  callback: (key: string) => void;
  leftHanded: boolean;
}) => {
  return (
    <button className="key" onClick={() => props.callback(props.letter)}>
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
  bind: (key: string, action: Action) => void;
  unbind: (key: string) => void;
  keyMap: KeyMap;
  modifier: string;
  leftHanded: boolean;
}): JSX.Element => {
  const [bindingModalKeys, setBindingModalKeys]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("");
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

  const getModified = (letter: string): string =>
    props.modifier === "" ? letter : `${props.modifier} + ${letter}`;

  const keyHandler = (letter: string): void => {
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
                key={letter}
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
