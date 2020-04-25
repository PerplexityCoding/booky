function getTabs(query = { currentWindow: true }) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(query, (data) => {
      console.log(data);
      resolve(data);
    });
  });
}

export { getTabs };
