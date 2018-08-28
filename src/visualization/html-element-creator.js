import {defaultClassSelectors} from './defaults';

export default class HTMLElementCreator {
  static createElement(elementName, attributes = []) {
    const el = document.createElement(elementName);
    if (attributes !== null) {
      attributes.forEach(attr => {
        el.setAttribute(attr[0], attr[1]);
      });
    }

    return el;
  }
  static createSettingsGroup(childElements = []) {
    const settingsGroup = HTMLElementCreator.createElement('div', [['class', defaultClassSelectors.settingsGroup]]);
    if (childElements !== null) {
      childElements.forEach(child => {
        settingsGroup.append(child);
      });
    }

    return settingsGroup;
  }
  static createLabeledInput(labelText, labelAttributes, inputAttributes) {
    const div = HTMLElementCreator.createElement('div');

    const label = HTMLElementCreator.createElement('label', labelAttributes);
    label.textContent = labelText;

    const input = HTMLElementCreator.createElement('input', inputAttributes);

    div.appendChild(label);
    div.appendChild(input);

    return div;
  }
  static createLabeledValue(label, value) {
    const labeledValue = HTMLElementCreator.createElement('span');
    labeledValue.innerHTML = `${label}: ${value}`;
    return labeledValue;
  }
}