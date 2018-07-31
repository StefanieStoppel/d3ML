import {defaultOptions} from './defaults'

export default class Validator {
  isValidOptions(options) {
    let result = false;
    if(!!options &&
      typeof options === 'object' &&
      !Array.isArray(options) &&
      Object.keys(options).every(val => Object.keys(defaultOptions).includes(val))
    ) {
      result = true;
    }
    return result
  }
  isValidData(data, types) {
    let result = false;
    if (!!data && Array.isArray(data) && data.length > 0) {
      result = data.every(d => {
        const keysValid = ['x', 'y', 'type'].every(key => Object.keys(d).includes(key));
        const valuesValid = ['x', 'y', 'type'].every(key => {
          const val = d[key];
          if (key === 'x' || key === 'y') {
            return !!val && typeof val === 'number' && val !== Infinity && val !== -Infinity;
          } else if (key === 'type') {
            return !!val && types.includes(val);
          }
        });
        return keysValid && valuesValid;
      });
    }
    return result;
  }
}