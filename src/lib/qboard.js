import { fabric } from "fabric";
import { Network } from "@mehra/ts";
import instantiateTools, { Tool } from "./tools";
import Page from "./page";
import Pages from "./pages";
import HistoryHandler from "./history";
import FileHandler, { JSONReader } from "./files";
import ClipboardHandler from "./clipboard";
import StyleHandler from "./styles";
import ActionHandler from "./action";
import KeyboardHandler from "./keyboard";
import { isFabricCollection, } from "../types/fabric";
import AssertType from "../types/assert";
export default class QBoard {
    constructor(canvasElement, baseCanvasElement, canvasWidth, canvasHeight) {
        this.canvasElement = canvasElement;
        this.baseCanvasElement = baseCanvasElement;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.currentStyle = {
            dash: 0 /* Dash.Solid */,
            stroke: "#000000" /* Stroke.Black */,
            fill: 0 /* Fill.Transparent */,
        };
        this.drawerOptions = {
            fill: "transparent",
            stroke: "#000000",
            strokeWidth: 4,
            selectable: false,
            strokeDashArray: [0, 0],
            strokeUniform: true,
        };
        this.dragActive = false;
        this.isDown = false;
        this.strict = false;
        /**
         * Intentionally mutable global state object
         */
        this.globalState = {};
        this.updateState = () => {
            var _a;
            (_a = this === null || this === void 0 ? void 0 : this.callback) === null || _a === void 0 ? void 0 : _a.call(this, {
                dragActive: this.dragActive,
                currentPage: this.pages.currentIndex + 1,
                totalPages: this.pages.pagesJSON.length,
                currentStyle: this.currentStyle,
                canUndo: this.history.history.length > 0,
                canRedo: this.history.redoStack.length > 0,
                keyMap: this.keyboard.keyMap,
            });
        };
        /**
         * Assumes no two instances are the same tool
         */
        this.switchTool = async (tool = this.tools.Move) => {
            // Reference equality because of assumption
            if (tool === this.activeTool || !(await tool.activate()))
                return;
            this.activeTool.deactivate();
            if (tool.isBrush() || tool.requiresBase()) {
                this.baseCanvas.activateSelection();
                this.canvasElement.parentElement.style.display = "none";
            }
            else {
                this.baseCanvas.deactivateSelection();
                this.canvasElement.parentElement.style.display = "block";
            }
            if (tool.isBrush()) {
                await tool.setBrush(this.baseCanvas.freeDrawingBrush, this.drawerOptions);
            }
            this.activeTool = tool;
            this.baseCanvas.isDrawingMode = this.activeTool.isBrush();
            this.updateState();
        };
        this.windowResize = () => {
            if (this.resizeCooldown !== undefined)
                clearTimeout(this.resizeCooldown);
            this.resizeCooldown = setTimeout(() => {
                this.canvas.fitToWindow(this.canvasWidth, this.canvasHeight);
                this.baseCanvas.fitToWindow(this.canvasWidth, this.canvasHeight);
            }, 100);
        };
        this.mouseDown = async (e) => {
            if (!this.activeTool.isDrawing())
                return;
            const { x, y } = this.canvas.getPointer(e.e);
            this.isDown = true;
            this.currentObject = await this.activeTool.draw(x, y, this.drawerOptions);
            this.canvas.add(this.currentObject);
            this.canvas.requestRenderAll();
        };
        this.mouseMove = async (e) => {
            var _a, _b;
            if (!(this.activeTool.isDrawing() && this.isDown))
                return;
            const { x, y } = this.canvas.getPointer(e.e);
            if (this.currentObject !== undefined)
                await ((_b = (_a = this.activeTool).resize) === null || _b === void 0 ? void 0 : _b.call(_a, this.currentObject, x, y, this.strict));
            this.canvas.requestRenderAll();
        };
        this.mouseUp = () => {
            if (!this.activeTool.isDrawing())
                return;
            this.isDown = false;
            this.baseCanvas.add(fabric.util.object.clone(this.currentObject));
            this.baseCanvas.requestRenderAll();
            AssertType(this.currentObject); // can do this because mouseDown sets this
            this.canvas.remove(this.currentObject);
            this.canvas.requestRenderAll();
            this.history.add([this.currentObject]);
        };
        this.setDragActive = (state) => {
            this.dragActive = state;
            this.updateState();
        };
        this.drop = async (iEvent) => {
            iEvent.e.stopPropagation();
            iEvent.e.preventDefault();
            await this.updateCursor(iEvent);
            this.setDragActive(false);
            await this.files.processFiles(iEvent.e.dataTransfer.files);
        };
        this.pathCreated = (e) => {
            if (this.activeTool.isBrush())
                this.activeTool.pathCreated(e);
        };
        this.selectionCreated = (e) => {
            if (this.history.locked)
                return;
            return this.history.store(e.selected);
        };
        this.objectModified = (e) => {
            const objects = isFabricCollection(e.target)
                ? e.target.getObjects()
                : [e.target];
            this.history.modify(objects); // old selection was replaced with this selection
            this.history.store(objects); // new state of selection
        };
        this.updateCursor = (iEvent) => {
            const { x, y } = this.baseCanvas.getPointer(iEvent.e);
            this.baseCanvas.cursor = { x, y };
        };
        const queryParams = new URLSearchParams(window.location.search);
        this.baseCanvas = new Page(baseCanvasElement, {
            backgroundColor: "white",
            renderOnAddRemove: false,
            selection: false,
            targetFindTolerance: 15,
        });
        this.canvas = new Page(canvasElement, {
            renderOnAddRemove: false,
            selection: false,
        });
        this.pages = new Pages(this.baseCanvas, this.canvasWidth, this.canvasHeight, this.updateState);
        {
            const jsonLink = queryParams.get("json");
            if (jsonLink !== null)
                Network.loadJSON(jsonLink)
                    .then(JSONReader.readParsed)
                    .then(this.pages.overwritePages)
                    // eslint-disable-next-line no-console
                    .catch(console.error);
        }
        this.history = new HistoryHandler(this.baseCanvas, this.pages, this.updateState);
        this.files = new FileHandler(this.pages, this.history);
        this.clipboard = new ClipboardHandler(this.baseCanvas, this.pages, this.files, this.history, this.canvasWidth, this.canvasHeight);
        this.style = new StyleHandler(this.currentStyle, this.drawerOptions, this.baseCanvas.freeDrawingBrush, this.updateState);
        this.tools = instantiateTools(this.baseCanvas, this.history, this.clipboard);
        this.action = new ActionHandler(this.switchTool, this.tools, this.currentStyle, this.pages, this.files, this.history, this.clipboard, this.style.set, this.globalState);
        this.keyboard = new KeyboardHandler(this.action.doAction, (strict) => (this.strict = strict), this.updateState);
        // an instance which has no effect (deactivate method is trivial)
        this.activeTool = new Tool(this.baseCanvas, this.history, this.clipboard);
        void this.switchTool();
        void this.windowResize();
        window.onresize = this.windowResize;
        window.onbeforeunload = () => this.baseCanvas.modified || null;
        {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            this.canvas.on("mouse:down", this.mouseDown);
            this.canvas.on("mouse:move", this.mouseMove);
            this.canvas.on("mouse:up", this.mouseUp);
            this.baseCanvas.on("dragenter", () => this.setDragActive(true));
            this.baseCanvas.on("dragleave", () => this.setDragActive(false));
            this.baseCanvas.on("drop", this.drop);
            // @ts-ignore
            this.baseCanvas.on("path:created", this.pathCreated);
            // @ts-ignore
            this.baseCanvas.on("selection:created", this.selectionCreated);
            // @ts-ignore
            this.baseCanvas.on("object:modified", this.objectModified);
            this.baseCanvas.on("mouse:move", this.updateCursor);
            /* eslint-enable @typescript-eslint/ban-ts-comment */
        }
    }
}
