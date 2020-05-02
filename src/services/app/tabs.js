import { uuidv4 } from "../../utils/utils";
import { getTabs as getChromeTabs } from "../chrome/tabs";

function createItemFromTab(tab) {
  return {
    id: uuidv4(),
    tabId: tab.id,
    body: tab.title,
    href: tab.url,
    icon: tab.favIconUrl,
  };
}

async function getTabs(query) {
  const chromeTabs = await getChromeTabs(query);
  return chromeTabs.map((tab) => createItemFromTab(tab));
}

export { createItemFromTab, getTabs };
