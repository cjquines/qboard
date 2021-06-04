import React, { useState } from "react";
import Modal from "react-modal";

import { Action } from "../lib/action";
import { KeyMap } from "../lib/keyboard";

import BindingModal from "./BindingModal";
import { Keyboard, UIKeyDescriptor } from "./Keyboard";
import { NonEmptyArray } from "@mehra/ts";

Modal.setAppElement("#Overlay");

const Bindings = (props: {
  bind: (key: string, action: Action) => void;
  unbind: (key: string) => void;
  keyMap: KeyMap;
}): JSX.Element => {
  const [bindingHotkey, setBindingHotkey] = useState<string>("");
  const [hotkeyAction, setHotkeyAction] = useState<Action | null>(null);
  const [modifiers, setModifiers] = useState(new Set<string>());

  const modify = (key: string) =>
    [
      ...Array.from(modifiers).sort(), // these are such small arrays that performance doesn't really matter
      key,
    ].join(" + ");

  const Key = (key: string) => ({
    key,
    action: props.keyMap[modify(key)],
  });

  const Keys = (keys: string[]) => keys.map(Key);

  const rows: Readonly<
    NonEmptyArray<Readonly<NonEmptyArray<UIKeyDescriptor>>>
  > = [
    [
      { ...Key("`"), width: "3em" },
      ...Keys(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]),
    ],
    [
      { type: "readonly", key: "tab", value: "Hide Toolbar", width: "4.5em" },
      ...Keys(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"]),
    ],
    [
      { ...Key("esc"), width: "6em" },
      ...Keys(["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"]),
    ],
    [
      { type: "modifier", key: "shift", value: "Snap", width: "7.5em" },
      ...Keys(["z", "x", "c", "v", "b", "n", "m", "/"]),
      { type: "modifier", key: "ctrl" },
      { type: "modifier", key: "alt" },
    ],
  ];

  const keyHandler = (key: string): void => {
    const modified = modify(key);
    setBindingHotkey(modified);
    setHotkeyAction(props.keyMap[modified]);
  };

  return (
    <>
      <Keyboard
        rows={rows}
        className={"bindings"}
        onclick={keyHandler}
        activeModifiers={modifiers}
        setActiveModifiers={setModifiers}
      />
      <BindingModal
        letter={bindingHotkey}
        action={hotkeyAction}
        close={() => setBindingHotkey("")}
        callback={(action) => {
          props.unbind(bindingHotkey);
          if (action) props.bind(bindingHotkey, action);
          setBindingHotkey("");
        }}
      />
    </>
  );
};

export default Bindings;
