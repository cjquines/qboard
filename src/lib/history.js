import AssertType from "../types/assert";
export default class HistoryHandler {
    constructor(canvas, pages, updateState) {
        this.canvas = canvas;
        this.pages = pages;
        this.updateState = updateState;
        this.history = [];
        this.redoStack = [];
        this.selection = null;
        this.latestId = 0;
        this.locked = false;
        /**
         * Behavior is undefined if the same object is in both the `add` and `remove` properties of {@param command}
         */
        this.execute = (command = {}) => {
            if (command.clear)
                this.clear(command.clear[0]);
            this.add(command.add);
            this.remove(command.remove);
        };
        /**
         * Creates a history event adding {@param objects} if it is nonempty.
         */
        this.add = (objects) => {
            if (objects === null || objects === void 0 ? void 0 : objects.length)
                this.save({ newObjects: objects });
        };
        /**
         * Creates a history event removing {@param objects} if it is nonempty.
         */
        this.remove = (objects) => {
            if (objects === null || objects === void 0 ? void 0 : objects.length)
                this.save({ oldObjects: objects });
        };
        this.clear = (clearRedo = false) => {
            this.history = [];
            if (clearRedo)
                this.redoStack = [];
            this.updateState();
        };
        /**
         * Have history remember the current selection {@param objects},
         * in case it is deleted/modified.
         */
        this.store = (objects) => {
            if (this.locked)
                return;
            this.locked = true;
            this.selection = this.canvas.serialize(objects);
            this.locked = false;
        };
        /**
         * If the active selection (known to history) is modified to become {@param objects}
         */
        this.modify = (objects) => this.save({ oldObjects: this.selection, newObjects: objects });
        this.getNextId = () => {
            return ++this.latestId;
        };
        this.setIdIfNotPresent = (object) => {
            AssertType(object);
            if (object.idVersion !== 1 || object.id === undefined) {
                // Legacy versions would export ids in the serialized files,
                // and we don't want those because they can clash.
                // Instead of deleting all these ids at import time,
                // we do it at history push time.
                object.idVersion = 1;
                object.id = this.getNextId();
            }
            return object.id;
        };
        /**
         * Adds an entry to the history stack where {@param oldObjects} are replaced by {@param newObjects}.
         * Does not check to make sure that these are nonempty;
         * you may be creating an empty entry in history in this case.
         */
        this.save = ({ oldObjects, newObjects, }) => {
            if (this.locked)
                return;
            const basis = newObjects || oldObjects;
            this.locked = true;
            this.history.push({
                ids: basis.map(this.setIdIfNotPresent),
                oldObjects: newObjects ? oldObjects : this.canvas.serialize(oldObjects),
                newObjects: newObjects && this.canvas.serialize(newObjects),
                page: this.pages.currentIndex,
            });
            this.locked = false;
            this.redoStack = [];
            this.canvas.modified = true;
            this.updateState();
        };
        this.undo = async () => {
            if (!this.history.length)
                return;
            this.canvas.discardActiveObject();
            await this.move(this.history, this.redoStack, true);
        };
        this.redo = async () => {
            if (!this.redoStack.length)
                return;
            await this.move(this.redoStack, this.history, false);
        };
        this.move = async (from, to, isUndo) => {
            if (!from.length)
                return;
            this.locked = true;
            const last = from.pop();
            await this.pages.loadPage(last.page);
            this.canvas.apply(last.ids, isUndo ? last.oldObjects : last.newObjects);
            to.push(last);
            this.locked = false;
            this.canvas.modified = true;
            this.updateState();
        };
    }
}
