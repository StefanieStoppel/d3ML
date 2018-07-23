import Visualization from './visualization/visualization';

document.addEventListener('DOMContentLoaded', (event) => {
  const data = [
    { x: 25, y: 36 },
    { x: 56, y: 73 },
    { x: 65, y: 135 },
    { x: 75, y: 103 },
    { x: 173, y: 64 },
    { x: 44, y: 122 },
    { x: 47, y: 38 },
    { x: 346, y: 10 },
    { x: 346, y: 410 }
  ];
  const options = {
    rootNode: 'body',
    backgroundColor: 'black',
    circleFill: 'green',
    circleStroke: 'white'
  };
  const vis = new Visualization(data, options);
  vis.draw();
});

export {
  Visualization
};
