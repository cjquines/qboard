import React, { useEffect, useState } from "react";

import { Action } from "../lib/action";

import { Visibility } from "./Overlay";
import OverlayButton from "./OverlayButton";

const Pagination = (props: {
  loadPage: (index: number) => Promise<void | number>;
  currentPage: number;
  totalPages: number;
  doAction: (action: Action) => void;
  visibility: Visibility;
}): JSX.Element => {
  const [value, setValue] = useState(0);
  const [width, setWidth] = useState("0.6em");

  useEffect(() => {
    setValue(props.currentPage);
    setWidth(`${0.6 * props.currentPage.toString().length}em`);
  }, [props]);

  const navigate = async () => {
    if (!value) return;
    const page = Number(value);
    if (!page || page > props.totalPages) {
      setValue(props.currentPage);
    } else {
      await props.loadPage(page - 1);
    }
  };

  useEffect(() => void navigate(), [value]);

  const onSubmit = (e) => {
    e?.preventDefault();
    return navigate();
  };

  const onChange = (e) => setValue(e.target.value);

  return (
    <div className={`pagination visibility-${props.visibility}`}>
      <OverlayButton
        action={
          props.currentPage === 1 ? Action.AddPageStart : Action.PreviousPage
        }
        callback={props.doAction}
      />
      <form onSubmit={onSubmit}>
        <input
          onChange={onChange}
          type="text"
          value={value}
          style={{ width }}
          tabIndex={-1}
        />
      </form>
      <span className="total-pages"> / {props.totalPages}</span>
      <OverlayButton
        action={
          props.currentPage === props.totalPages
            ? Action.AddPageEnd
            : Action.NextPage
        }
        callback={props.doAction}
      />
    </div>
  );
};

export default Pagination;
