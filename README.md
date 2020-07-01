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

keybindings:
- tab toggle overlay visibility
- q (quick switcher: not implemented)
- w copy
- e ellipse
- r rectangle
- t (text: not implemented)
- a previous page
- s next / add page
- d pen
- f undo / F redo
- g paste
- z default style
- x cut / eraser
- c line
- v move
- b (unassigned?)
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
- with space for blank

todo:
- implement text
- add undo, redo, style visibilities properly
- clear page, delete page
- change style of selected with chord?
- come up with better chords for the fill style ugh
- something that pops up near your cursor when you press q

nice features:
- help modal, intro modal
- rooms for spectating
- rooms for collaboration
- load prev/next pages in memory?
- make the eraser not use the bounding box?
- make move not use the bounding box?
- saving things to the server for a limited period?
