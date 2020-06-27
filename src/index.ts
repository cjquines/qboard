import { fabric } from "fabric";
import "./main.scss";

class Board {
  canvas: fabric.Canvas;

  constructor(
    canvasElement: HTMLCanvasElement,
    readonly canvasWidth: number,
    readonly canvasHeight: number
  ) {
    this.canvas = new fabric.Canvas(canvasElement);
    this.canvas.backgroundColor = "white";

    // temporary rectangle for now:
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "red",
      width: 100,
      height: 100,
    });
    this.canvas.add(rect);
  }

  resize = (width: number, height: number): void => {
    const widthRatio = width / this.canvasWidth;
    const heightRatio = height / this.canvasHeight;
    this.canvas.setZoom(Math.min(widthRatio, heightRatio));
    this.canvas.setWidth(this.canvasWidth * this.canvas.getZoom());
    this.canvas.setHeight(this.canvasHeight * this.canvas.getZoom());
  }
}

const board = new Board(document.getElementById("canvas") as HTMLCanvasElement, 1600, 900);

const fitToWindow = (): void => {
  board.resize(window.innerWidth, window.innerHeight);
}

let resizeCooldown = setTimeout(fitToWindow, 0);
window.onresize = (): void => {
  clearTimeout(resizeCooldown);
  resizeCooldown = setTimeout(fitToWindow, 100);
}
