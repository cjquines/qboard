import React, { useState, useEffect } from "react";

import QBoard, { QBoardState } from "./qboard";
import { Tool } from "./tools";
import { Dash, Stroke, Fill } from "./styles";

const Pagination = (props: {
  previousPage: () => Promise<void>;
  nextOrNewPage: () => Promise<void>;
  loadPage: (number) => Promise<void>;
  currentPage: number;
  totalPages: number;
}) => {
  const [value, setValue] = useState(0);
  const [width, setWidth] = useState("0.6em");

  useEffect(() => {
    setValue(props.currentPage);
    setWidth(0.6 * props.currentPage.toString().length + "em");
  }, [props]);

  const onSubmit = (e) => {
    e && e.preventDefault();
    const page = Number(value);
    if (!page || page > props.totalPages) {
      setValue(props.currentPage);
    } else {
      props.loadPage(page - 1);
    }
  };

  const onChange = (e) => setValue(e.target.value);

  return (
    <div className="pagination">
      <button onClick={props.previousPage}>
        <i className="fas fa-caret-left" />
      </button>
      <form onSubmit={onSubmit}>
        <input
          onChange={onChange}
          type="text"
          value={value}
          style={{ width }}
        />
      </form>
      <span className="total-pages"> / {props.totalPages}</span>
      <button onClick={props.nextOrNewPage}>
        <i className="fas fa-caret-right" />
      </button>
    </div>
  );
};

const Toolbar = (props: {
  switchTool: (tool: Tool) => Promise<void>;
  currentTool: Tool;
}) => {
  const tools = [
    {
      tool: Tool.Move,
      icon: "fa-mouse-pointer",
    },
    {
      tool: Tool.Pen,
      icon: "fa-pen",
    },
    {
      tool: Tool.Eraser,
      icon: "fa-eraser",
    },
    {
      tool: Tool.Line,
      icon: "fa-minus",
      style: { transform: "rotate(-45deg)" },
    },
    {
      tool: Tool.Ellipse,
      icon: "fa-circle",
    },
    {
      tool: Tool.Rectangle,
      icon: "fa-square",
    },
  ];

  return (
    <div className="toolbar">
      {tools.map(({ tool, icon, style }) => {
        return (
          <button key={tool} onClick={(e) => props.switchTool(tool)}>
            <i className={`fas ${icon}`} style={style} />
          </button>
        );
      })}
    </div>
  );
};

const Overlay = (props: { qboard: QBoard }) => {
  const qboard = props.qboard;
  const [state, setState] = useState<QBoardState>({
    currentPage: 0,
    totalPages: 0,
  });

  useEffect(() => {
    qboard.callback = setState;
    qboard.updateState();
  }, []);

  return (
    <div className="overlay">
      <Toolbar switchTool={qboard.switchTool} currentTool={Tool.Move} />
      <Pagination
        previousPage={qboard.pages.previousPage}
        nextOrNewPage={qboard.pages.nextOrNewPage}
        loadPage={qboard.pages.loadPage}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
      />
    </div>
  );
};

export default Overlay;
