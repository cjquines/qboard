import React, { useEffect, useState } from "react";
import keyboardJS from "keyboardjs";
import { defaultKeys } from "../lib/keyboard";
import Pagination from "./Pagination";
import UndoRedo from "./UndoRedo";
import Toolbar from "./Toolbar";
import Stylebar from "./Stylebar";
import HelpModal from "./HelpModal";
import ContextMenu from "./ContextMenu";
import VirtualFileInput from "./VirtualFileInput";
const Overlay = ({ qboard }) => {
    const [visibility, setVisibility] = useState(2 /* Visibility.Full */);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    // const [isMobile, setMobility] = useState(false);
    const isMobile = true;
    const [state, setState] = useState({
        dragActive: false,
        currentPage: 0,
        totalPages: 0,
        currentStyle: {
            dash: 0 /* Dash.Solid */,
            stroke: "#000000" /* Stroke.Black */,
            fill: 0 /* Fill.Transparent */,
        },
        canUndo: false,
        canRedo: false,
        keyMap: defaultKeys,
    });
    const toggleOpen = () => {
        setHelpModalOpen((wasOpen) => {
            window.localStorage.setItem("helpModalOpen", wasOpen ? "false" : "true");
            return !wasOpen;
        });
    };
    // Code is temporarily dead as a result of https://github.com/cjquines/qboard/issues/91;
    // Commenting so it can get erased in build
    /*const toggleMobility = (): void => {
      setMobility((wasMobile) => {
        window.localStorage.setItem("isMobile", wasMobile ? "false" : "true");
        return !wasMobile;
      });
    };*/
    useEffect(() => {
        if (window.localStorage.getItem("helpModalOpen") !== "false") {
            setHelpModalOpen(true);
        }
        // if (window.localStorage.getItem("isMobile") !== "false") {
        //   setMobility(true);
        // }
        qboard.callback = setState;
        qboard.globalState.toggleHelpModal = toggleOpen;
        qboard.updateState();
        keyboardJS.bind("tab", () => {
            setVisibility((currentVisibility) => (currentVisibility + 2) % 3);
        });
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(VirtualFileInput, { acceptFiles: qboard.files.acceptFile, captureRef: (ref) => {
                qboard.globalState.fileInputRef = ref;
            }, accept: "application/json, application/pdf, image/*" }),
        React.createElement("div", { className: `drop-area ${state.dragActive ? "active" : ""}` }),
        React.createElement("div", { className: `overlay visibility-${visibility}` },
            React.createElement(Pagination, { loadPage: qboard.pages.loadPage, currentPage: state.currentPage, totalPages: state.totalPages, doAction: qboard.action.doAction, visibility: visibility }),
            React.createElement(UndoRedo, { canUndo: state.canUndo, canRedo: state.canRedo, doAction: qboard.action.doAction, visibility: visibility }),
            React.createElement(Toolbar, { currentTool: qboard.activeTool, tools: qboard.tools, doAction: qboard.action.doAction, visibility: visibility }),
            React.createElement(Stylebar, { currentStyle: state.currentStyle, doAction: qboard.action.doAction, visibility: visibility, isMobile: isMobile }),
            React.createElement(HelpModal, { bind: qboard.keyboard.bind, unbind: qboard.keyboard.unbind, reset: qboard.keyboard.reset, keyMap: state.keyMap, isOpen: helpModalOpen, toggleOpen: toggleOpen, isMobile: isMobile })),
        React.createElement(ContextMenu, { currentStyle: state.currentStyle, doAction: qboard.action.doAction })));
};
export default Overlay;
