import {fixLayout} from "../components/dnd-grid/utils";

export function fixLayoutSize(layout, lists, bubbleUp) {
  const listById = lists.reduce((acc, value) => {
    acc[value.id] = value;
    return acc;
  });
  for (const itemLayout of layout) {
    const list = listById[itemLayout.id];
    if (list != null) {
      itemLayout.position.h = Math.max(list.items.length + 1, 2);
    }
  }
  return fixLayout(layout, bubbleUp);
}
