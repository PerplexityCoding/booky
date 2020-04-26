<template>
  <div class="dashboard">
    <dnd-grid-container
      :layout="myLayout"
      :cell-size="cellSize"
      :max-column-count="maxColumnCount"
      :outer-margin="10"
      :margin="5"
      :default-size="defaultSize"
      :bubble-up="bubbleUp"
      :resizable="false"
      @drag:start="onDragStart"
      @drag:end="onDragEnd"
      @update:layout="onUpdateLayout"
    >
      <dashboard-list
        v-for="(list, index) in lists"
        :key="'dnd-box-' + list.id"
        :box-id="list.id"
        :list.sync="lists[index]"
        :locked="locked"
        :is-dragging="isDragging"
        @card-drop="cardDrop"
        @card-enter="cardEnter"
        @card-leave="cardLeave"
        @drag-start="backupLayout"
        @delete-list="deleteList"
        @change="onChange"
      />
    </dnd-grid-container>
  </div>
</template>

<script>
import { Container as DndGridContainer } from "./dnd-grid";
import DashboardList from "./DashboardList";
import { fixLayout, layoutBubbleUp } from "./dnd-grid/utils";

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
      originalLayout: null,
      myLayout: this.layout,
      cellSize: {
        h: 40,
        w: 205,
      },
      defaultSize: {
        w: 1,
        h: 2,
      },
      maxColumnCount: 8,
    };
  },
  mounted() {
    this.backupLayout();
  },
  methods: {
    onUpdateLayout(value) {
      console.log(value);
      this.myLayout = value;
      this.$emit("update:layout", value);
    },
    onDragStart() {
      this.isDragging = true;
      this.backupLayout();
    },
    async onDragEnd() {
      setTimeout(() => {
        this.isDragging = false;
      });
      this.$emit("change");
      this.backupLayout();
    },
    backupLayout() {
      this.originalLayout = JSON.parse(JSON.stringify(this.myLayout));
    },
    deleteList(id) {
      const lists = this.lists.filter((i) => i.id !== id);
      this.$emit("update:lists", lists);

      this.myLayout = this.myLayout.filter((i) => i.id !== id);
      if (this.bubbleUp) {
        this.myLayout = layoutBubbleUp(this.myLayout);
      }
      this.$emit("update:layout", this.myLayout);
      this.$emit("change");
    },
    cardDrop(list) {
      this.updateLayout(list, this.myLayout, 1);
      this.$emit("change");
    },
    cardEnter(list, isDraggingSource) {
      this.updateLayout(list, this.originalLayout, isDraggingSource ? 1 : 2);
    },
    cardLeave(list, isDraggingSource) {
      this.updateLayout(list, this.originalLayout,isDraggingSource ? 0 : 1);
    },
    updateLayout(list, layout, inc) {
      const listLayout = layout.filter((i) => i.id === list.id)[0];
      const height = list.items.length + inc;
      listLayout.position.h = Math.max(height, 2);

      this.myLayout = fixLayout(layout);
      this.$emit("update:layout", this.myLayout);
    },
    async onChange({ list, deleteItem } = {}) {
      if (deleteItem && list) {
        this.updateLayout(list, this.myLayout, 1);
      }
      this.$emit("change");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/colors.scss";

.box-item {
  height: 100px;
  width: 100px;
  background-color: grey;
}

.dashboard {
  flex: 1;
  background-color: darken($purpleColor4, 2%);
  height: 100%;
  overflow: auto;
}
</style>
