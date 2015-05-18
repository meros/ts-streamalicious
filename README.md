Streamalicious
----
Async stream library written in TypeScript.
Why?
----
Streams are nice and flexible in the simple array processing case, and async streams enables you to solve some problems in a few lines that would normally be either serialized (slow) or complex. 
JS has some type of stream-like behaviour built in (array prototypes) but these are not always available (IE8) and directly connected to the array prototype which means they are not always usable for non-array stream like objects (generators etc)
Why TypeScript?
----
Stream libraries benefit heavily from type support. Doing long chains of transform/filter/collect changes the type in an error prone way. Using TypeScript the fact that the type changes becomes a pro instead of a con.
Status
----
The lib is in an early stage, the library sources are in src/lib, jasmine tests in src/test. To run tests do gulp verify. To compile and minify do gulp dist.
