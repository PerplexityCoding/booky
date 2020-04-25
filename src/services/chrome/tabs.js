function getTabs(query = { currentWindow: true }) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(query, resolve);
  });
}

export { getTabs };
