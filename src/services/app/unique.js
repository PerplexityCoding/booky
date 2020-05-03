window.BOOKY_GLOBAL = window.BOOKY_GLOBAL || {};

function globalGet(key) {
  return window.BOOKY_GLOBAL[key];
}

function globalSet(key, value) {
  window.BOOKY_GLOBAL[key] = value;
}

export { globalSet, globalGet };
