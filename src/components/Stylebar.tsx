import React, { useEffect, useRef, useState } from "react";

import { Style } from "../lib/styles";
import { Action } from "../lib/action";

import { Visibility } from "./Overlay";
import ButtonRow from "./ButtonRow";
import Icon from "./Icon";
import StyleMenu from "./StyleMenu";

const Stylebar = (props: {
  currentStyle: Style;
  doAction: (action: Action) => Promise<void>;
  openFile: (files: FileList) => Promise<void>;
  visibility: Visibility;
  isMobile: boolean;
}) => {
  const fileInputRef = useRef(null);
  const fileButton = <button className="inactive">{Icon.file}</button>;
  const fileActions = [Action.Open, Action.Save, Action.Export];

  const otherActions = [Action.Copy, Action.Paste];
  const mobileActions = props.isMobile ? [Action.FullScreen] : [];

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", (e) =>
      setIsFullscreen(Boolean(document.fullscreenElement))
    );
  }, []);

  return (
    <div className={`stylebar visibility-${props.visibility}`}>
      <input
        accept=".json"
        onChange={(e) => props.openFile(e.target.files)}
        multiple={true}
        ref={fileInputRef}
        type="file"
      />
      <ButtonRow
        actions={fileActions}
        callback={async (action) => {
          if (action === Action.Open) {
            fileInputRef.current.click();
          } else {
            props.doAction(action);
          }
        }}
        outerButton={fileButton}
      />
      <ButtonRow
        actions={otherActions}
        callback={props.doAction}
        vertical={true}
      />
      <StyleMenu currentStyle={props.currentStyle} doAction={props.doAction} />
      <ButtonRow
        actions={mobileActions.map((action) =>
          action === Action.FullScreen
            ? !isFullscreen
              ? Action.EnterFullScreen
              : Action.ExitFullScreen
            : action
        )}
        callback={props.doAction}
        vertical={true}
      />
    </div>
  );
};

export default Stylebar;
