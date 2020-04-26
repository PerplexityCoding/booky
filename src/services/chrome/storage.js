function storageGet(values) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(values, (data) => {
      console.log("Get Value ", data);
      resolve(data);
    });
  });
}

function storageSet(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, () => {
      // console.log("Value is set to " + data);
      resolve(data);
    });
  });
}

export { storageSet, storageGet };
