function storageGet(values, type = "sync") {
  return new Promise((resolve) => {
    chrome.storage[type].get(values, async (data) => {
      // console.log("Get Value ", JSON.stringify(data, null, 4));

      if (data.lists && data.lists.length > 0) {
        await migrate(data.lists);
        data = await storageGet(values, type);
      }

      resolve(data);
    });
  });
}

async function storageGetValue(key, type = "sync") {
  const value = await storageGet(key);
  if (value) {
    return value[key];
  }
  return null;
}

function storageSet(data, type = "sync") {
  return new Promise((resolve) => {
    chrome.storage[type].set(data, () => {
      // console.log("Value is set to ", data);
      resolve(data);
    });
  });
}

function storageRemove(data, type = "sync") {
  return new Promise((resolve) => {
    chrome.storage[type].remove(data, () => {
      // console.log("Remove Value ", data);
      resolve();
    });
  });
}

async function migrate(lists) {
  const listsId = lists.map((list) => list.id);
  const listById = lists.reduce((acc, value) => {
    acc[value.id] = {
      type: "list",
      ...value,
    };
    return acc;
  }, {});

  await storageSet(listById);
  await storageSet({ listsId });
  await storageRemove("lists");
}

export { storageSet, storageGet, storageGetValue, storageRemove };
