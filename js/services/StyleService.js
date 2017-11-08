import * as configuration from '../configuration';

export default class StyleService {
  constructor() {
    this._lang = configuration.language;
    this._serviceUrl = `${configuration.urlConfiguration.mapapi}/api/styles`;
  }

  listStyles() {
    return $.ajax(`${this.serviceUrl}/?lang=${this._lang}`);
  }

  getStyle(styleId) {
    return $.ajax(`${this.serviceUrl}/${styleId}?lang=${this._lang}`);
  }

  get lang() {
    return this._lang;
  }

  set lang(value) {
    this._lang = value;
  }

  get serviceUrl() {
    return this._serviceUrl;
  }

  set serviceUrl(value) {
    this._serviceUrl = value;
  }
}
