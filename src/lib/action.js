import { fabric } from "fabric";
import AssertType from "../types/assert";
import TeXToDataURL from "./latex";
export var Action;
(function (Action) {
    Action["PreviousPage"] = "previousPage";
    Action["NextPage"] = "nextPage";
    Action["AddPageStart"] = "addPageStart";
    Action["AddPageEnd"] = "addPageEnd";
    Action["Undo"] = "undo";
    Action["Redo"] = "redo";
    Action["Open"] = "open";
    Action["Save"] = "save";
    Action["Export"] = "export";
    Action["Cut"] = "cut";
    Action["Copy"] = "copy";
    Action["Paste"] = "paste";
    Action["Deselect"] = "deselect";
    Action["SelectAll"] = "selectAll";
    Action["Duplicate"] = "duplicate";
    Action["Move"] = "move";
    Action["Pen"] = "pen";
    Action["Eraser"] = "eraser";
    Action["Laser"] = "laser";
    Action["Line"] = "line";
    Action["Ellipse"] = "ellipse";
    Action["Rectangle"] = "rectangle";
    Action["LaTeX"] = "latex";
    Action["Dotted"] = "dotted";
    Action["Dashed"] = "dashed";
    Action["Solid"] = "solid";
    Action["Black"] = "black";
    Action["Blue"] = "blue";
    Action["Green"] = "green";
    Action["Orange"] = "orange";
    Action["Yellow"] = "yellow";
    Action["Transparent"] = "transparent";
    Action["HalfFilled"] = "halfFilled";
    Action["Filled"] = "filled";
    Action["Help"] = "help";
    Action["ResetStyles"] = "resetStyles";
    Action["FullScreen"] = "fullScreen";
    Action["EnterFullScreen"] = "enterFullScreen";
    Action["ExitFullScreen"] = "exitFullScreen";
})(Action || (Action = {}));
const nameMap = {
    previousPage: "–Page",
    nextPage: "+Page",
    addPageStart: "-Page",
    addPageEnd: "+Page",
    selectAll: "Select All",
    duplicate: "Clone",
    eraser: "Cut / Eraser",
    rectangle: "Rect.",
    latex: "LaTeX",
    transparent: "Unfilled",
    halfFilled: "Half Fill",
    resetStyles: "Reset Styles",
    fullScreen: "Full Screen",
    enterFullScreen: "Enter Full Screen",
    exitFullScreen: "Exit Full Screen",
};
export const actionName = (action) => {
    var _a;
    const name = (_a = nameMap[action]) !== null && _a !== void 0 ? _a : action;
    return name[0].toUpperCase() + name.slice(1);
};
export default class ActionHandler {
    constructor(switchTool, tools, currentStyle, pages, files, history, clipboard, setStyle, 
    /**
     * Intentionally mutable global state object
     */
    globalState) {
        this.switchTool = switchTool;
        this.currentStyle = currentStyle;
        this.pages = pages;
        this.files = files;
        this.history = history;
        this.clipboard = clipboard;
        this.setStyle = setStyle;
        this.globalState = globalState;
        this.doAction = (action) => this.actionMap[action]();
        this.setDash = (dash) => {
            if (dash === this.currentStyle.dash) {
                this.setStyle(0 /* Dash.Solid */, null, null);
            }
            else {
                this.setStyle(dash, null, null);
            }
        };
        this.setStroke = (stroke) => {
            if (stroke === this.currentStyle.stroke) {
                this.setStyle(null, "#000000" /* Stroke.Black */, null);
            }
            else {
                this.setStyle(null, stroke, null);
            }
        };
        this.setFill = (fill) => {
            if (fill === this.currentStyle.fill) {
                this.setStyle(null, null, 0 /* Fill.Transparent */);
            }
            else {
                this.setStyle(null, null, fill);
            }
        };
        this.requestTeX = async () => {
            const text = window.prompt("Enter LaTeX source");
            if (text === null)
                return "no latex entered";
            let dataURL;
            try {
                dataURL = TeXToDataURL(text);
            }
            catch (e) {
                AssertType(e);
                // eslint-disable-next-line no-console
                console.error(e, e.node);
                window.alert(`Error in LaTeX: ${e.errorText}

More details printed to console.`);
                return "invalid latex";
            }
            const img = await this.canvas.addImage(dataURL, undefined, {
                scaleX: 3,
                scaleY: 3,
                data: { texSource: text },
            });
            this.history.add([img]);
            // apparently this does something?
            await this.history.undo();
            await this.history.redo();
            return "success";
        };
        this.canvas = this.pages.canvas;
        this.actionMap = {
            previousPage: pages.previousOrNewPage,
            nextPage: pages.nextOrNewPage,
            addPageStart: pages.previousOrNewPage,
            addPageEnd: pages.nextOrNewPage,
            undo: history.undo,
            redo: history.redo,
            open: () => { var _a, _b; return (_b = (_a = globalState.fileInputRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.click(); },
            save: pages.saveFile,
            export: pages.export,
            cut: clipboard.cut,
            copy: clipboard.copy,
            paste: clipboard.paste,
            deselect: () => {
                this.canvas.discardActiveObject();
                this.canvas.requestRenderAll();
            },
            selectAll: () => {
                this.canvas.discardActiveObject();
                this.canvas.setActiveObject(new fabric.ActiveSelection(this.canvas.getObjects(), {
                    canvas: this.canvas,
                }));
                this.canvas.requestRenderAll();
            },
            duplicate: () => {
                this.clipboard.copy();
                this.clipboard.paste();
            },
            move: () => this.switchTool(tools.Move),
            pen: () => this.switchTool(tools.Pen),
            eraser: () => this.switchTool(tools.Eraser),
            laser: () => this.switchTool(tools.Laser),
            line: () => this.switchTool(tools.Line),
            ellipse: () => this.switchTool(tools.Ellipse),
            rectangle: () => this.switchTool(tools.Rectangle),
            latex: this.requestTeX,
            dotted: () => this.setDash(2 /* Dash.Dotted */),
            dashed: () => this.setDash(1 /* Dash.Dashed */),
            solid: () => this.setDash(0 /* Dash.Solid */),
            blue: () => this.setStroke("#0097f6" /* Stroke.Blue */),
            green: () => this.setStroke("#00b253" /* Stroke.Green */),
            yellow: () => this.setStroke("#ffbf00" /* Stroke.Yellow */),
            orange: () => this.setStroke("#ff2600" /* Stroke.Orange */),
            black: () => this.setStroke("#000000" /* Stroke.Black */),
            transparent: () => this.setFill(0 /* Fill.Transparent */),
            halfFilled: () => this.setFill(2 /* Fill.HalfSolid */),
            filled: () => this.setFill(1 /* Fill.Solid */),
            resetStyles: () => this.setStyle(0 /* Dash.Solid */, "#000000" /* Stroke.Black */, 0 /* Fill.Transparent */),
            help: () => { var _a; return (_a = globalState.toggleHelpModal) === null || _a === void 0 ? void 0 : _a.call(globalState); },
            fullScreen: () => this.doAction(!document.fullscreenElement
                ? Action.EnterFullScreen
                : Action.ExitFullScreen),
            enterFullScreen: () => document.documentElement.requestFullscreen(),
            exitFullScreen: () => document.exitFullscreen(),
        };
    }
}
