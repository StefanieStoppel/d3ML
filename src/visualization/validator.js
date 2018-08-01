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
        if (!d) {
          return false;
        }
        let keys = ['x', 'y'];
        let hasType = false;
        if (!!types && Array.isArray(types) && types.length > 0) {
          keys.push('type');
          hasType = true;
        }
        const validTypes = hasType ? Object.keys(d).includes('type') : !Object.keys(d).includes('type');
        const validKeys = keys.every(key => Object.keys(d).includes(key));
        const validValues = keys.every(key => {
          let res;
          const val = d[key];
          if (key === 'x' || key === 'y') {
            res = !!val && typeof val === 'number' && val !== Infinity && val !== -Infinity;
          } else if (key === 'type') {
            res = !!val && types.includes(val);
          }

          return res;
        });

        return validKeys && validValues && validTypes;
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
