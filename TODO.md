- ~~should also update for two variables~~
- ~~hoist the slider number storage up to the node~~
- ~~display that number so that it stays up to date with the slider~~
- ~~throttle the slider so that it doesn't update the code too often~~

FIX:

- it should be derived if there are any variable references in it. should not show a slider (y = x to 4) should NOT show a slider

# []: # Path: TODO.md

Directly edit squiggle code from range slider and have it update immediately.
That means not using the text editor throttle. But rather throttling the slider
and a lower level and feeding the updated code directly into the squiggle mechanism.

- we will need some way to tell the input slider to update if the text is edited manually
