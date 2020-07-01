import React, { useState, useEffect } from "react";
import keyboardJS from "keyboardjs";

import QBoard, { QBoardState } from "./qboard";
import { Tool } from "./tools";
import { Dash, Stroke, Fill } from "./styles";

const enum Visibility {
  None,
  Condensed,
  Full,
}

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
    <div className={`pagination visibility-${props.visibility}`}>
      <button
        className={value === 1 ? "disabled" : undefined}
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
        />
      </form>
      <span className="total-pages"> / {props.totalPages}</span>
      <button onClick={props.nextOrNewPage}>
        {value === props.totalPages ? (
          <i className="fas fa-plus" style={{ transform: "scale(0.7)" }} />
        ) : (
          <i className="fas fa-caret-right" />
        )}
      </button>
    </div>
  );
};

const Toolbar = (props: {
  switchTool: (tool: Tool) => Promise<void>;
  currentTool: Tool;
  visibility: Visibility;
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
    <div className={`toolbar visibility-${props.visibility}`}>
      {tools.map(({ tool, icon, style }) => {
        return (
          <button
            className={tool === props.currentTool && "active"}
            key={tool}
            onClick={(e) => props.switchTool(tool)}
          >
            <i className={`fas ${icon}`} style={style} />
          </button>
        );
      })}
    </div>
  );
};

const Overlay = (props: { qboard: QBoard }) => {
  const qboard = props.qboard;

  const [visibility, setVisibility] = useState(Visibility.Full);
  const [state, setState] = useState<QBoardState>({
    currentPage: 0,
    totalPages: 0,
    currentTool: Tool.Move,
  });

  useEffect(() => {
    qboard.callback = setState;
    qboard.updateState();

    keyboardJS.bind("q", (e) => {
      console.log("fire");
      setVisibility((visibility) => (visibility + 2) % 3);
    });
  }, []);

  return (
    <div className={`overlay visibility-${visibility}`}>
      <Toolbar
        switchTool={qboard.switchTool}
        currentTool={state.currentTool}
        visibility={visibility}
      />
      <Pagination
        previousPage={qboard.pages.previousPage}
        nextOrNewPage={qboard.pages.nextOrNewPage}
        loadPage={qboard.pages.loadPage}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        visibility={visibility}
      />
    </div>
  );
};

export default Overlay;
