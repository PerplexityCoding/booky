import { uuidv4 } from "../../utils/utils";
import { getTabs as getChromeTabs } from "../chrome/tabs";

export async function getTabs(query) {
  const chromeTabs = await getChromeTabs(query);
  return chromeTabs.map((tab) => ({
    id: tab.id,
    body: tab.title,
    href: tab.url,
    icon: tab.favIconUrl,
  }));
}
