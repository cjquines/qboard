import React, { useEffect, useState } from "react";

import { Visibility } from "./Overlay";

const Pagination = (props: {
  previousPage: () => Promise<void>;
  nextOrNewPage: () => Promise<void>;
  loadPage: (number) => Promise<void>;
  currentPage: number;
  totalPages: number;
  visibility: Visibility;
}) => {
  const [value, setValue] = useState(0);
  const [width, setWidth] = useState("0.6em");

  useEffect(() => {
    setValue(props.currentPage);
    setWidth(0.6 * props.currentPage.toString().length + "em");
  }, [props]);

  const navigate = () => {
    if (!value) return;
    const page = Number(value);
    if (!page || page > props.totalPages) {
      setValue(props.currentPage);
    } else {
      props.loadPage(page - 1);
    }
  };

  useEffect(() => navigate(), [value]);

  const onSubmit = (e) => {
    e && e.preventDefault();
    navigate();
  };

  const onChange = (e) => setValue(e.target.value);

  return (
    <div className={`pagination visibility-${props.visibility}`}>
      <button
        className={props.currentPage === 1 ? "disabled" : undefined}
        onClick={props.previousPage}
      >
        <i className="fas fa-caret-left" />
      </button>
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
      <button onClick={props.nextOrNewPage}>
        {props.currentPage === props.totalPages ? (
          <i className="fas fa-plus" style={{ transform: "scale(0.7)" }} />
        ) : (
          <i className="fas fa-caret-right" />
        )}
      </button>
    </div>
  );
};

export default Pagination;
