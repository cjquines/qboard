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
  acceptFile: (files: FileList) => Promise<void>;
  visibility: Visibility;
  isMobile: boolean;
}): JSX.Element => {
  const fileInputRef = useRef(null);
  const fileButton = <button className="inactive">{Icon.file}</button>;
  const fileActions = [Action.Open, Action.Save, Action.Export];

  const otherActions = [Action.Copy, Action.Paste];
  const mobileActions = props.isMobile ? [Action.FullScreen] : [];

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", () =>
      setIsFullscreen(Boolean(document.fullscreenElement))
    );
  }, []);

  return (
    <div className={`stylebar visibility-${props.visibility}`}>
      <input
        accept=""
        onChange={(e) => props.acceptFile(e.target.files)}
        multiple={false}
        ref={fileInputRef}
        type="file"
      />
      <ButtonRow
        actions={fileActions}
        callback={async (action) => {
          if (action === Action.Open) {
            fileInputRef.current.click();
          } else {
            await props.doAction(action);
          }
        }}
        cName="file-actions"
        outerButton={fileButton}
      />
      <ButtonRow
        actions={otherActions}
        cName="other-actions vertical"
        callback={props.doAction}
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
        cName="mobile-actions vertical"
      />
    </div>
  );
};

export default Stylebar;
