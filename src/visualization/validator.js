import {defaultOptions} from './defaults';

export default class Validator {
  static isValidOptions(options) {
    let result = false;
    if (!!options &&
      typeof options === 'object' &&
      !Array.isArray(options) &&
      Object.keys(options).every(val => Object.keys(defaultOptions).includes(val))
    ) {
      result = true;
    }

    return result;
  }
  static isValidData(data, types) {
    let result = false;
    if (!!data && Array.isArray(data) && data.length > 0) {
      result = data.every(d => {
        const keysValid = ['x', 'y', 'type'].every(key => Object.keys(d).includes(key));
        const valuesValid = ['x', 'y', 'type'].every(key => {
          let res;
          const val = d[key];
          if (key === 'x' || key === 'y') {
            res = !!val && typeof val === 'number' && val !== Infinity && val !== -Infinity;
          } else if (key === 'type') {
            res = !!val && types.includes(val);
          }

          return res;
        });

        return keysValid && valuesValid;
      });
    }

    return result;
  }
  static isValidTypes(types) {
    let result = false;
    if (!!types && Array.isArray(types) && types.every(t => typeof t === 'number' || typeof t === 'string')) {
      result = true;
    }

    return result;
  }
  static isValidK(k) {
    let result = false;
    if (!!k && Number.isInteger(k) && k > 0) {
      result = true;
    }

    return result;
  }
}
