LAYOUT:

- ~~drag and forget~~
  - ~~create location cache~~
  - ~~lookup location when running cytoscape~~
- ~~make the arrowhead smaller~~
- ~~add a button to clear the node locations~~
- ~~drag and remember~~
  - ~~when copying url or saving file, save the node locations and instantiate them when loading~~
- force directed non-animated
- force directed animated

FIX:

- it should be derived if there are any variable references in it. should not show a slider (y = x to 4) should NOT show a slider
- the parsing bug
- there's a bug where sliders jump back to their initial position if you edit the code manually after
- copy share URL not populated on first load of project
- copy share URL not populated when just moving a node

# []: # Path: TODO.md

Directly edit squiggle code from range slider and have it update immediately.
That means not using the text editor throttle. But rather throttling the slider
and a lower level and feeding the updated code directly into the squiggle mechanism.

- we will need some way to tell the input slider to update if the text is edited manually

// use custom node locations
const customNodeLocations = useNodeLocation.getState();
