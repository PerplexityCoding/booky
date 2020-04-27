<template>
  <smooth-dnd-container
    behaviour="copy"
    group-name="tabs"
    class="side-bar-container"
    :should-accept-drop="() => false"
    :drag-handle-selector="locked ? '.none' : ''"
    :get-child-payload="getCardPayloadFromTabsList()"
    @
  >
    <smooth-dnd-draggable
      v-for="tab in tabs"
      :key="`tab-${tab.id}`"
      class="tab-item"
    >
      <item :item="tab" />
    </smooth-dnd-draggable>
  </smooth-dnd-container>
</template>

<script>
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "vue-smooth-dnd";
import Item from "./Item";

export default {
  name: "SideBar",
  components: {
    SmoothDndContainer,
    SmoothDndDraggable,
    Item,
  },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    locked: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getCardPayloadFromTabsList() {
      return (index) => {
        return this.tabs[index];
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.side-bar-container {
  height: calc(100vh - 30px);
  overflow: auto;
  padding: 0 3px;
}

.tab-item {
  padding: 2px;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }
}
</style>
