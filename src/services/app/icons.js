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

async function loadIcon(url) {
  const now = +new Date();

  if (!gCacheIcons[url]) {
    gCacheIcons[url] = {
      data: await toDataURL(url),
      ts: now,
    };

    storeIcons();
  }

  return gCacheIcons[url].data;
}

export { loadIcon, loadIcon as getIcon, loadIcons };
