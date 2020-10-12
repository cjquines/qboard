import React, { useEffect, useRef, useState } from "react";

import { Style } from "../lib/styles";
import { Action } from "../lib/action";

import { Visibility } from "./Overlay";
import StyleMenu from "./StyleMenu";
import OverlayButton from "./OverlayButton";

const Stylebar = (props: {
  currentStyle: Style;
  doAction: (Action) => Promise<void>;
  openFile: (Event) => Promise<void>;
  visibility: Visibility;
  isMobile: boolean;
}) => {
  const actions = [Action.Save, Action.Copy, Action.Paste];
  const mobileMethods = props.isMobile ? [Action.FullScreen] : [];
  const fileInputRef = useRef(null);

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
        onChange={props.openFile}
        multiple={true}
        ref={fileInputRef}
        type="file"
      />
      <OverlayButton
        action={Action.Open}
        callback={async () => fileInputRef.current.click()}
      />
      {actions.map((action) => (
        <OverlayButton action={action} callback={props.doAction} key={action} />
      ))}
      <StyleMenu currentStyle={props.currentStyle} doAction={props.doAction} />
      {mobileMethods.map((action) => (
        <OverlayButton
          action={
            action === Action.FullScreen
              ? !isFullscreen
                ? Action.EnterFullScreen
                : Action.ExitFullScreen
              : action
          }
          callback={props.doAction}
          key={action}
        />
      ))}
    </div>
  );
};

export default Stylebar;
