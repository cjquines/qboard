# qboard

_The efficient digital whiteboard._

**qboard** is a whiteboard app with efficient keyboard shortcuts, to make drawing feel as seamless as possible. In the spirit of Vim, it's possible to do everything that isn't drawing without moving your hands. It's hosted on [my website](https://cjquines.com/qboard/). Here's a [demo video](https://youtu.be/8NvXHukL8ic).

## Features

Here are the default keybindings:

![](public/bindings.png)

Image assumes Caps Lock is mapped to Escape. Tab cycles through three toolbar visibilities: the full toolbar, a status pane, and completely hidden. Shift snaps lines to multiples of 45°, and makes squares and circles.

X is Cut when there's something selected, and Eraser when nothing is selected. The Eraser is element level: it removes entire paths. You can use X to delete whatever you have selected. E or R, when already that color, resets it to black.

There are also keybindings with Shift and Ctrl, which you can view in-app. Other neat things you can do:

- Hit the save button to save to a PDF. The export button exports to a JSON file, which you can later open and edit.
- Hit Ctrl+V to paste images from the system clipboard. You can also drag images to the board.
- Right-clicking to bring up a context menu to change the style.

## Design principles

qboard is made for seamless lecturing. It's designed to be easy to use and nice to look at while sharing your screen. It should also be easy to share what you've written afterward as a PDF. This guides some of its principles:

- It should be possible to do everything that isn't drawing just with keys. Ideally, only with the keys on one half of the keyboard, to make presentations flow smoothly. You shouldn't need to move your mouse all the way to the left to change tools, or to move your hand to the right to switch to the pen tool.
- By default, it has pages, rather than extending in different directions. It should feel like writing on multiple blackboards, and not an infinite sheet of paper.
- Pages are fixed at a 16:9 ratio, so when they're later saved to a PDF, it's in the same dimensions as a slideshow.

There are _some_ sense to the default keybindings:

- The three keys I use the most are on F, D, and S. A is assigned to make sense with S, and Shift + F to make sense with F.
- I tend to switch between colors and back while presenting, hence the E and R bindings.
- Imitating vim, X is like delete, which both cuts and erases.
- Ellipse and Rectangle start with E and R, while V is Move in Photoshop too.
- Q, A, and Z control stroke style, and W, S, and X control fill style. They form a column, going from "least" to "most".
- The Ctrl keybindings are pretty universal, except maybe D, for Duplicate.

Although initially designed for giving lectures, the whiteboard controls are pretty good. I might add support for extending infinitely in several directions, in the style of a regular whiteboard app.

## Implementation details

It's build on the [nwb](https://github.com/insin/nwb) toolkit, which handles React, Webpack, and Babel. We're using Typescript. The main app is mostly powered through [Fabric.js](http://fabricjs.com/), with [KeyboardJS](https://github.com/RobertWHurst/KeyboardJS) handling keybindings, and [pdfmake](http://pdfmake.org/#/) handling exporting to PDF.

We extend the Fabric canvas to a [Page class](src/lib/pages.ts) with some convenience functions. The Pages class stores pages in a JSON array; whenever we switch pages, we remove all the objects in the canvas and reload from memory.

We also work with _two_ canvas elements. The top canvas is a temporary one that renders lines, ellipses, and rectangles as they're being drawn, and after they're drawn, they're removed and added to the base canvas. The base canvas handles everything else: the move tool, free drawing, the eraser, and so on; the top canvas is hidden for these operations. This is for performance reasons, so the base canvas doesn't have to rerender every time the mouse moves on the top canvas.

The main source is [qboard.ts](src/lib/qboard.ts), which handles listening to mouse events and switching tools. Everything else is delegated to handlers, which are in individual files:

- [action.ts](src/lib/action.ts), which abstracts the actions for the front-end.
- [clipboard.ts](src/lib/clipboard.ts), which handles cutting, copying, and pasting.
- [history.ts](src/lib/history.ts), which undoes and redoes with a pure(-ish) history stack.
- [keyboard.ts](src/lib/keyboard.ts), which catches keyboard events that aren't H.
- [styles.ts](src/lib/styles.ts), which gives an interface for changing pen style.
- [tools.ts](src/lib/tools.ts), which implements each non-free-drawing tool.

Running `npm start` will start the development server. Run `npm run build` to bundle it. There's also a [Dockerfile](Dockerfile); build the image with `docker build -t qboard .`, then run with `docker run -d --name qboard qboard`.

The FabricJS file is huge and it doesn't support tree shaking, so the qboard demo uses a [custom build](http://fabricjs.com/build/). It includes gestures, animation, free drawing, interaction, serialization, fabric.Rect, fabric.Ellipse, fabric.Image, fabric.Line, and window.fabric, which I think is the absolute minimum needed for it to work. (Do note that custom build currently [has issues](https://github.com/fabricjs/fabric.js/issues/6624), though.)
