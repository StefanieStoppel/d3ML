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
  static createLabeledInput(labelText, labelAttributes, displayedValue, inputAttributes) {
    const div = HTMLElementCreator.createElement('div');

    const valueSpan = HTMLElementCreator.createElement('span');
    valueSpan.innerHTML = displayedValue;

    const label = HTMLElementCreator.createElement('label', labelAttributes);
    label.textContent = labelText;
    label.appendChild(valueSpan);

    const input = HTMLElementCreator.createElement('input', inputAttributes);

    div.appendChild(label);
    div.appendChild(input);

    return div;
  }
  static createLabeledValue(label, value) {
    const labelElement = HTMLElementCreator.createElement('span');
    labelElement.innerHTML = `${label}: `;
    labelElement.setAttribute('class', 'label');

    const valueElement = HTMLElementCreator.createElement('span');
    valueElement.innerHTML = value;
    valueElement.setAttribute('class', 'value');

    const wrapper = HTMLElementCreator.createElement('div');
    wrapper.appendChild(labelElement);
    wrapper.appendChild(valueElement);

    return wrapper;
  }
  static createSettings(children = []) {
    const settings = HTMLElementCreator.createElement('div', [['class', defaultClassSelectors.settings]]);
    children.forEach(childSetting => {
      settings.appendChild(childSetting);
    });

    return settings;
  }
}
