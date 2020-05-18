<template>
  <div class="dashboard">
    <dnd-grid-container
      :layout="layout"
      :cell-size="cellSize"
      :max-column-count="maxColumnCount"
      :outer-margin="10"
      :margin="5"
      :default-size="defaultSize"
      :bubble-up="bubbleUp"
      :resizable="false"
      :draggable="!locked"
      @drag:start="onDragStart"
      @drag:end="onDragEnd"
      @update:layout="(value) => $emit('update:layout', value)"
    >
      <dashboard-list
        v-for="(list, index) in lists"
        :key="'dnd-box-' + list.id"
        :box-id="list.id"
        :list.sync="lists[index]"
        :locked="locked"
        :is-dragging="isDragging"
        :item-width="cellSize.w"
        @card-drop="cardDrop"
        @card-enter="cardEnter"
        @card-leave="cardLeave"
        @drag-end="cardDragEnd"
        @delete-list="deleteList"
        @change:list="onChange"
      />
    </dnd-grid-container>
  </div>
</template>

<script>
import { Container as DndGridContainer } from "./dnd-grid";
import DashboardList from "./DashboardList";
import { fixLayout, layoutBubbleUp } from "./dnd-grid/utils";
import { fixBrokenLayout, fixLayoutSize } from "../utils/dnd-grid";

export default {
  name: "Dashboard",
  components: {
    DashboardList,
    DndGridContainer,
  },
  props: {
    layout: {
      type: Array,
      required: true,
    },
    lists: {
      type: Array,
      required: true,
    },
    locked: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isDragging: false,
      bubbleUp: true,
      topLayout: true,
      cellSize: {
        h: 44,
        w: 150,
      },
      defaultSize: {
        w: 1,
        h: 2,
      },
      maxColumnCount: 8,
    };
  },
  mounted() {
    const calcSize = () =>
      (this.cellSize.w = Math.max(
        Math.floor(this.$el.offsetWidth / this.maxColumnCount) - 7,
        150
      ));
    calcSize();
    window.addEventListener("resize", () => {
      calcSize();
    });
  },
  methods: {
    onDragStart() {
      this.isDragging = true;
    },
    async onDragEnd() {
      setTimeout(() => {
        this.isDragging = false;
      });
      this.$emit("change");
    },
    copyLayout() {
      return JSON.parse(JSON.stringify(this.layout));
    },
    async deleteList(id) {
      const list = this.lists.filter((i) => i.id === id)[0];
      const lists = this.lists.filter((i) => i.id !== id);
      this.$emit("update:lists", lists);
      await this.$nextTick();

      let layout = fixBrokenLayout(this.layout, lists);
      layout = fixLayoutSize(layout, lists, this.bubbleUp);

      this.$emit("update:layout", layout);
      this.$emit("change:list", { list, toDelete: true });
      this.$emit("change");
    },
    cardDrop(list) {
      let layout = this.copyLayout();
      layout = fixLayoutSize(layout, this.lists, this.bubbleUp);
      this.$emit("update:layout", layout);
      this.$emit("change:list", { list });
      this.$emit("change");
    },
    cardEnter(list, isDraggingSource) {
      const layout = this.copyLayout();
      this.updateLayout(list, layout, isDraggingSource ? 1 : 2);
    },
    cardLeave(list, isDraggingSource) {
      const layout = this.copyLayout();
      this.updateLayout(list, layout, isDraggingSource ? 0 : 1);
    },
    cardDragEnd() {
      let layout = this.copyLayout();
      layout = fixLayoutSize(layout, this.lists, this.bubbleUp);
      this.$emit("update:layout", layout);
    },
    updateLayout(list, layout, inc) {
      const listLayout = layout.filter((i) => i.id === list.id)[0];
      const height = list.items.length + inc;
      listLayout.position.h = Math.max(height, 2);

      layout = fixLayout(layout, this.bubbleUp);
      this.$emit("update:layout", layout);
    },
    async onChange({ list, deleteItem } = {}) {
      if (deleteItem && list) {
        this.updateLayout(list, this.layout, 1);
      }
      this.$emit("change:list", { list });
      this.$emit("change");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/mixins.scss";

.dashboard {
  @include backgroundColor(--primary-color1);
  overflow: auto;
}
</style>
