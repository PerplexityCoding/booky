import { storageGet, storageSet } from "../chrome/storage";
import { toDataURL } from "../../utils/icons";
import { debounce } from "../../utils/utils";

let gCacheIcons = {};

const storeIcons = debounce(() => {
  storageSet({ cacheIcons: gCacheIcons }, "local");
}, 1000);

async function loadIcons() {
  const cacheIcons = (await storageGet("cacheIcons", "local")).cacheIcons;
  const now = +new Date();

  for (const iconUrl in cacheIcons) {
    const cachedIcon = cacheIcons[iconUrl];
    if (now - cachedIcon.ts > 7 * 24 * 60 * 60 * 1000) {
      // 7 days cache
      delete cacheIcons[iconUrl];
    }
  }

  gCacheIcons = cacheIcons;
  storeIcons();
}

function getIcon(url) {
  if (!gCacheIcons[url]) {
    loadIcon(url);
    return url;
  }

  return gCacheIcons[url].data;
}

async function loadIcon(url) {
  const data = await toDataURL(url);

  gCacheIcons[url] = {
    data,
    ts: (+new Date()),
  };

  storeIcons();

  return gCacheIcons[url].data;
}

export { loadIcon, getIcon, loadIcons };
