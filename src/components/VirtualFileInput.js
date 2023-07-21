import React, { useRef } from "react";
const VirtualFileInput = ({ acceptFiles, captureRef, ...attrs }) => {
    const fileInputRef = useRef(null);
    captureRef === null || captureRef === void 0 ? void 0 : captureRef(fileInputRef);
    return (React.createElement("input", { onChange: acceptFiles === undefined
            ? undefined
            : (e) => {
                var _a;
                if ((_a = e.target.files) === null || _a === void 0 ? void 0 : _a.length)
                    acceptFiles(e.target.files);
            }, ref: fileInputRef, type: "file", style: { display: "none" }, ...attrs }));
};
export default VirtualFileInput;
