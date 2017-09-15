# MGraph
Dead simple Cartesian coordinate system. Plug in an HTML element into the constructor and draw onto the canvas. 
The graph is positioned in the top left corner of the given element.

Usage
===
```htmlElement
<script type="text/javascript" src="path/MGraph.js"></script>
```
Examples
===

```js
var htmlElement = document.getElementById('some-div');
var graph = new MGraph(htmlElement);
graph.point(5, 5, 3, 'green');
graph.line(-3, 3, 6, -8);
```
---
```js
for (var i = -10; i < 10; i+= 0.2) {
	graph.cross(i, 5 * Math.sin(i), 0.3, 1, '#ff231c');
}
```
---
```js
var radius = 5;
for (var i = -radius; i < radius; i += 0.001) {
	var upperSemicircle = Math.sqrt(radius*radius - i*i);
	graph.point(i, upperSemicircle, 1, '#1e96ff');
	var lowerSemicircle = -upperSemicircle;
	graph.point(i, lowerSemicircle, 1, '#1e96ff');
}
```
---
```js
graph.clear();
var newConfig = {
	originCoordinates: {x: 10, y: 10},
	unit: 30,
	bgColor: '#fffcc1',
	gridlineDash: [0,0],
	axesLabels: false,
	pointColor: '#00F',
	pointRadius: 10
}
graph.setConfig(newConfig);
graph.point(10, 10);
```
---