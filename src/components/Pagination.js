import React, { useEffect, useState } from "react";
import { Action } from "../lib/action";
import OverlayButton from "./OverlayButton";
const Pagination = (props) => {
    const [value, setValue] = useState(0);
    const [width, setWidth] = useState("0.6em");
    useEffect(() => {
        setValue(props.currentPage);
        setWidth(`${0.6 * props.currentPage.toString().length}em`);
    }, [props]);
    const navigate = async () => {
        if (!value)
            return;
        const page = Number(value);
        if (!page || page > props.totalPages) {
            setValue(props.currentPage);
        }
        else {
            await props.loadPage(page - 1);
        }
    };
    useEffect(() => void navigate(), [value]);
    const onSubmit = (e) => {
        e === null || e === void 0 ? void 0 : e.preventDefault();
        return navigate();
    };
    const onChange = (e) => setValue(e.target.value);
    return (React.createElement("div", { className: `pagination visibility-${props.visibility}` },
        React.createElement(OverlayButton, { action: props.currentPage === 1 ? Action.AddPageStart : Action.PreviousPage, callback: props.doAction }),
        React.createElement("form", { onSubmit: onSubmit },
            React.createElement("input", { onChange: onChange, type: "text", value: value, style: { width }, tabIndex: -1 })),
        React.createElement("span", { className: "total-pages" },
            " / ",
            props.totalPages),
        React.createElement(OverlayButton, { action: props.currentPage === props.totalPages
                ? Action.AddPageEnd
                : Action.NextPage, callback: props.doAction })));
};
export default Pagination;
