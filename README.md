# qboard

*The efficient digital whiteboard.*

**qboard** is a whiteboard app with efficient keyboard shortcuts, to make drawing feel as seamless as possible. In the spirit of Vim, it's possible to do everything that isn't drawing without moving your hands. It is sketchily hosted on [my website](https://cjquines.com/qboard/).

## Keybindings

Here are the default keybindings:

![](public/bindings.png)

Image assumes Caps Lock is mapped to Escape. Tab cycles through three toolbar visibilities: the full toolbar, a status pane, and completely hidden. Shift snaps lines to multiples of 45°, and makes squares and circles.

X is Cut when there's something selected, and Eraser when nothing is selected. The Eraser is element level: it removes entire paths. You can use X to delete whatever you have selected. E or R, when already that color, resets it to black.

There are also keybindings with Shift and Ctrl, which you can view in-app.

## Design principles

qboard is made for seamless lecturing. It's designed to be easy to use and nice to look at while sharing your screen. It should also be easy to share what you've written afterward as a PDF. This guides some of its principles:

- It should be possible to do everything that isn't drawing just with keys. Ideally, only with the keys on one half of the keyboard, to make presentations flow smoothly. You shouldn't need to move your mouse all the way to the left to change tools, or to move your hand to the right to switch to the pen tool.
- By default, it has pages, rather than extending in different directions. It should feel like writing on multiple blackboards, and not an infinite sheet of paper.
- Pages are fixed at a 16:9 ratio, so when they're later saved to a PDF, it's in the same dimensions as a slideshow.

There are *some* sense to the default keybindings:

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

We also work with *two* canvas elements. The top canvas is a temporary one that renders lines, ellipses, and rectangles as they're being drawn, and after they're drawn, they're removed and added to the base canvas. The base canvas handles everything else: the move tool, free drawing, the eraser, and so on; the top canvas is hidden for these operations. This is for performance reasons, so the base canvas doesn't have to rerender every time the mouse moves on the top canvas.

The main source is [qboard.ts](src/lib/qboard.ts), which handles listening to mouse events and switching tools. Everything else is delegated to handlers, which are in individual files:

### Todo

- change style of selected with keybinding, add to history too
- make toolbar show selected style, not pen style (what if multiple selection though?)
- something that pops up near your cursor when you right click ([as in this](https://medium.com/@subalerts/https-medium-com-implementing-custom-context-menu-in-react-js-part-1-b103260c724c))
- tooltips for the toolbar
- save the fabricjson so we can reopen to edit later?
- right-handed keybindings? dvorak?
- rooms for spectating?
- rooms for collaboration?
- add a style for pen width, make it discrete steps, keybinding like [ ] to increase and decrease it?
- two modes: one "slide" mode, and one "infinite" mode. panning can be space + drag, but what about zooming? shift+A, shift+S is one possibility?
- load prev/next pages in memory?
- make the eraser not use the bounding box?
- make dragging not use the bounding box?
- saving things to the server for a limited period?
