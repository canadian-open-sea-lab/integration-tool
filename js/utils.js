export function updateQueryString(key, value, url) {
  const re = new RegExp(`([?&])${key}=.*?(&|#|$)(.*)`, 'gi');
  let hash;
  let newUrl = url;

  if (re.test(url)) {
    if (typeof value !== 'undefined' && value !== null) {
      return url.replace(re, `$1${key}=${value}$2$3`);
    }

    hash = url.split('#');
    newUrl = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
    if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
      newUrl += `#${hash[1]}`;
    }
    return newUrl;
  }

  if (typeof value !== 'undefined' && value !== null) {
    const separator = url.indexOf('?') !== -1 ? '&' : '?';
    hash = url.split('#');
    newUrl = `${hash[0] + separator + key}=${value}`;
    if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
      newUrl += `#${hash[1]}`;
    }
    return newUrl;
  }
  return newUrl;
}

export function getParameterByName(name) {
  const parsedName = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${parsedName}=([^&#]*)`);
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(
    results[1].replace(/\+/g, ' '));
}

export function getObjectValue(obj, path, separator) {
  let separatorOrSlash = separator;
  let object = obj;
  let pathToSplit = path;
  if (!path) {
    return null;
  }
  if (!separator) {
    separatorOrSlash = '/';
  }
  let i;
  let len;
  for (i = 0, pathToSplit = pathToSplit.split(separatorOrSlash), len = pathToSplit.length; i < len;
    i += 1) {
    if (!object || typeof object !== 'object') {
      return null;
    }
    object = object[pathToSplit[i]];
  }
  if (object === undefined) {
    return null;
  }
  return object;
}
