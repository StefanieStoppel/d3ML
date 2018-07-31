# d3ML
A javascript library that visualizes how machine learning algorithms work using [d3.js](https://d3js.org/).

## About
The goal of d3ML is to create beautiful, interactive visualizations of machine learning algorithms to make them easier to understand.
You can check out [this](https://codepen.io/Qbrid/pen/OwpjLX?editors=1010) example visualization of the [K-Nearest Neighbor (KNN) algorithm](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) on codepen.


## Usage
At the moment d3ML is not available on npm yet. 
Instead you can paste the following code in your HTML to use the current version of the library from [rawgit](https://rawgit.com/) in your project:

```
<script src="https://rawgit.com/StefanieStoppel/d3ML/master/lib/d3ml.min.js"></script>
```

### Create a visualization of the K-Nearest Neighbor (KNN) algorithm
> Currently only the K-Nearest Neighbor (KNN) algorithm is implemented. 
```$xslt
var knnVis = new d3ml.KNNVisualization(data, options, types, k);
knnVis.draw();
```

### Parameters
`data`
---
`data` represents the data points you want to visualize.
It has to be an array containing objects with the keys `x`, `y` and `type`.
Example:
```
var data = [
  {x: 1,   y: 2,   type: 'A'},
  {x: 13,  y: 4,   type: 'B'},
  {x: 8,   y: 1,   type: 'B'},
  {x: 98,  y: 134, type: 'A'},
  {x: 5,   y: 42,  type: 'B'},
  {x: 100, y: 56,  type: 'A'},
  ...
];
```
The `x` and `y` values represent the data coordinates and have to be **numeric**.
`type` specifies the group that a certain data point belongs to.

`options`
---
You can pass options to specify the look of your visualization.
The default options object looks like this:
```$xslt
var options = {
  rootNode: 'body',
  width: 500,
  height: 300,
  padding: 50,
  backgroundColor: '#1d1e22',
  circleRadius: 5,
  circleFill: 'grey',
  circleStroke: 'white'
};
```

#### `rootNode`
A CSS selector specifying which DOM element the visualization will be attached to.

Default: `body`.

#### `width`
The width of the SVG for the visualization in pixels.

Default: `500`.

#### `height` 
The height of the SVG for the visualization in pixels.

Default: `300`.

#### `padding`
The domain of the visualization depends on your data. You can specify a padding (in pixels) to ensure 
that your data points are not too close to the edge of the SVG.

Default: `50`

#### `backgroundColor`
Set the background color of the visualization.

Default: `#1d1e22`, which is a dark grey.

#### `circleRadius`
The data points are displayed as circles. Set the radius (in pixels) of the circles with this option.

Default: `5`

#### `circleFill`
Set the fill color of the circles.

Default: `grey`

#### `circleStroke`
Set the stroke color of the circles.

Default: `white`



`types`
---
Types is an array with which you specify the types / groups that correspond to your data points.
For the example data
```$xslt
var data = [
  {x: 1, y: 2, type: 'A'}
  {x: 5, y: 4, type: 'B'}
  {x: 4, y: 7, type: 'A'}
  {x: 9, y: 2, type: 'B'}
];
```
types would be
```$xslt
var types = ['A', 'B'];
```

`k`
---
`k` sets the initial amount of neighbors that are taken into account when performing the KNN algorithm.
It has to be an integer.

Default: `3`
