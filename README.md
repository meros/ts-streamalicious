Streamalicious
----
Stream library written in TypeScript.
Why?
----
Streams are nice and flexible. JS has some type of stream-like behaviour built in (array prototypes) but these are not always available (IE8) and directly connected to the array prototype which means they are not always usable for non-array stream like objects (generators etc)
Why TypeScript?
----
Stream libraries benefit heavily from type support. Doing long chains of transform/filter/collect changes the type in an error prone way. Using TypeScript the fact that the type changes becomes a pro instead of a con.
Status
----
The lib is in an early stage, there is 1 file (streamalicious.ts) that implements the lib and the tests. You can compile that and run it with node.js to try it out.