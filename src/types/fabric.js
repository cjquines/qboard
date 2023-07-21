export function isFabricCollection(obj) {
    return "_objects" in obj;
}
export function isFabricTeXImage(image) {
    var _a;
    return typeof ((_a = image === null || image === void 0 ? void 0 : image.data) === null || _a === void 0 ? void 0 : _a.texSource) === "string";
}
