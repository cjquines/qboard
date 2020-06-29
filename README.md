# qboard

the whiteboard app i wish existed

basic features:
- fixed canvas size
- free drawing
- simple pagination
- printing to a pdf nicely
- switch brushes with left-hand keys
  - shapes
  - stroke
  - fill

keybindings for now:
- w copy
- e ellipse
- r rectangle
- t text
- a previous page
- s next / add page
- d pen
- f undo / F redo
- g paste
- x erase / cut
- c line
- v move
- esc deselect
- shift -> constrain

chording:
stroke style
- (blank) same
- w dotted
- a dashed
- s solid
border
- (blank) same
- e blue
- r green
- f black
- c yellow
- v orange
fill
- (blank) transparent
- d solid
- g 50% opaque
with space for blank

nice features:
- help panel
- rooms for spectating
- rooms for collaboration
- saving things to the server for a limited period
- load prev/next pages in memory

todo:
- make opaque fill have solid border (don't use opacity, use rgba for fill)
- make move not use the bounding box
- make the eraser not use the bounding box
- clear page, delete page
