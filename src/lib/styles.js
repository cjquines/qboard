const dashMap = [
    [0, 0],
    [20, 15],
    [5, 10],
];
export default class StyleHandler {
    constructor(currentStyle, drawerOptions, freeDrawingBrush, updateState) {
        this.currentStyle = currentStyle;
        this.drawerOptions = drawerOptions;
        this.freeDrawingBrush = freeDrawingBrush;
        this.updateState = updateState;
        this.set = (dash, stroke, fill) => {
            if (dash !== null) {
                this.currentStyle.dash = dash;
                this.drawerOptions.strokeDashArray = dashMap[dash];
                this.freeDrawingBrush.strokeDashArray = dashMap[dash];
            }
            if (stroke !== null) {
                this.currentStyle.stroke = stroke;
                this.drawerOptions.stroke = stroke;
                this.freeDrawingBrush.color = stroke;
            }
            if (fill !== null) {
                this.currentStyle.fill = fill;
            }
            if (stroke !== null || fill !== null) {
                switch (this.currentStyle.fill) {
                    case 0 /* Fill.Transparent */: {
                        this.drawerOptions.fill = "transparent";
                        break;
                    }
                    case 1 /* Fill.Solid */: {
                        this.drawerOptions.fill = this.currentStyle.stroke;
                        break;
                    }
                    case 2 /* Fill.HalfSolid */: {
                        this.drawerOptions.fill = `${this.currentStyle.stroke}11`;
                        break;
                    }
                }
            }
            this.updateState();
        };
    }
}
