import React, { useState } from "react";
import { NonEmptyArray } from "@mehra/ts";
import { Action, actionName } from "../lib/action";
import Icon from "./Icon";

/**
 * For keys whose bounding behavior cannot be changed;
 * these keys are already mapped to certain app events,
 * so the key diagram in the UI should not be a button.
 *
 * Use if it is meaningful to indicate the app behavior of this key.
 */
export const UnbindableKey = ({
  label = "",
  letter,
  width,
}: {
  letter: string;
  label?: string;
  width?: string;
}) => {
  return (
    <div className="key" style={{ width: width }}>
      <span className="letter">{letter}</span>
      <div className="action">
        <span className="unassigned">{label}</span>
      </div>
    </div>
  );
};

const ModifierKey = (props: {
  letter: string;
  set: Set<string>;
  label?: string;
  width?: string;
}) => {
  const [held, setHeld] = useState<boolean>(false);
  return (
    <button
      className={`key modifier ${held ? "active" : ""}`}
      onClick={() => {
        if (held) props.set.delete(props.letter);
        else props.set.add(props.letter);
        setHeld(!held);
      }}
      style={{ width: props.width }}
    >
      <div className="action">
        <span className="unassigned">{props.label}</span>
      </div>
      <span className="letter">{props.letter}</span>
    </button>
  );
};

export const Key = (props: {
  letter: string;
  action?: Action;
  onclick: (key: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  width?: string;
}) => {
  return (
    <button
      className="key"
      onClick={(event) => props.onclick(props.letter, event)}
      style={{ width: props.width }}
    >
      <div className="action">
        {props.action && Icon[props.action]}
        <span className={props.action === undefined ? "unassigned" : undefined}>
          {props.action === undefined ? "none" : actionName(props.action)}
        </span>
      </div>
      <span className="letter">{props.letter}</span>
    </button>
  );
};

interface ReadonlyKeyDescriptor {
  readonly type: "readonly";
  readonly value?: string;
}

interface ModifierKeyDescriptor {
  readonly type: "modifier";
  readonly value?: string;
}

interface ActionKeyDescriptor {
  readonly type?: "action";
  readonly action?: Action;
}

export type UIKeyDescriptor = {
  /** The symbol or word to be shown as the label for the key */
  readonly key: string;
  /** The hard-coded width of the key. Currently only care about `em` units. */
  readonly width?: `${number}${"em"}`;
} & (ReadonlyKeyDescriptor | ModifierKeyDescriptor | ActionKeyDescriptor);

/**
 * A keyboard UI component
 */
export const Keyboard = ({
  rows,
  onclick,
  ...attrs
}: {
  /** A double array of keys, specifying the layout and behavior */
  rows: Readonly<NonEmptyArray<Readonly<NonEmptyArray<UIKeyDescriptor>>>>;
  /**
   * Fired when a key button is pressed
   *
   * Technically, we shouldn't require this if every key is readonly.
   * I don't care.
   */
  onclick: (a: {
    key: string;
    modifiers: Set<string>;
    event: React.MouseEvent<HTMLButtonElement>;
  }) => void;
} & React.HTMLAttributes<HTMLDivElement>): JSX.Element => {
  const modifiers = new Set<string>();

  return (
    <div {...attrs}>
      {rows.map((row, index) => (
        <div className={"row"} key={index}>
          {row.map((keyData) =>
            keyData.type === "readonly" ? (
              <UnbindableKey
                key={keyData.key}
                letter={keyData.key}
                label={keyData.value}
                width={keyData.width}
              />
            ) : keyData.type === "modifier" ? (
              <ModifierKey
                key={keyData.key}
                letter={keyData.key}
                label={keyData.value}
                set={modifiers}
                width={keyData.width}
              />
            ) : (
              <Key
                key={keyData.key}
                letter={keyData.key}
                action={keyData.action}
                width={keyData.width}
                onclick={(key, event) => onclick({ key, modifiers, event })}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
};
