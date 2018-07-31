const defaultOptions = {
  rootNode: 'body',
  width: 500,
  height: 300,
  padding: 50,
  backgroundColor: '#1d1e22',
  circleRadius: 5,
  circleFill: 'grey',
  circleStroke: 'white'
};
const defaultType = 'None';

const defaultTypes = {
  A: 'A',
  B: 'B',
  None: 'None'
};

const defaultK = 3;

const defaultClassSelectors = {
  remove: 'remove',
  d3ml: 'd3ml',
  settings: 'd3ml__settings',
  settingsGroup: 'd3ml__settings__group'
};

export default {
  defaultOptions,
  defaultType,
  defaultTypes,
  defaultK,
  defaultClassSelectors
};
