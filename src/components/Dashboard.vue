<template>
  <dnd-grid-container
    :layout.sync="myLayout"
    :cell-size="cellSize"
    :max-column-count="maxColumnCount"
    :outer-margin="10"
    :default-size="defaultSize"
    :bubble-up="bubbleUp"
    :resizable="false"
    class="dashboard"
    @drag:end="$emit('change')"
  >
    <dashboard-list
      v-for="(list, index) in lists"
      :key="'dnd-box-' + list.id"
      :list.sync="lists[index]"
      :locked="locked"
      @card-drop="cardDrop"
      @card-enter="cardEnter"
      @card-leave="cardLeave"
      @drag-start="backupLayout"
      @delete-list="deleteList"
      @change="onChange"
    />
  </dnd-grid-container>
</template>

<script>
import { Container as DndGridContainer } from "./dnd-grid";
import DashboardList from "./DashboardList";
import { fixLayout } from "./dnd-grid/utils";

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
  watch: {
    myLayout() {
      this.$emit("update:layout", this.myLayout);
    },
  },
  mounted() {
    this.backupLayout();
  },
  methods: {
    backupLayout() {
      this.originalLayout = JSON.parse(JSON.stringify(this.myLayout));
    },
    deleteList(id) {
      const lists = this.lists.filter((i) => i.id !== id);
      this.$emit("update:lists", lists);

      this.myLayout = this.myLayout.filter((i) => i.id !== id);
      this.$emit("update:layout", this.myLayout);
      this.$emit("change");
      this.backupLayout();
    },
    cardDrop(list) {
      this.updateLayout(list, 1);
      this.$emit("change");
      this.backupLayout();
    },
    cardEnter(list, isDraggingSource) {
      this.updateLayout(list, isDraggingSource ? 1 : 2);
    },
    cardLeave(list, isDraggingSource) {
      this.updateLayout(list, isDraggingSource ? 0 : 1);
    },
    updateLayout(list, inc) {
      const listLayout = this.originalLayout.filter((i) => i.id === list.id)[0];
      const height = list.items.length + inc;
      listLayout.position.h = Math.max(height, 2);

      this.myLayout = fixLayout(this.originalLayout);
      this.$emit("update:layout", this.myLayout);
    },
    async onChange({ list, deleteItem } = {}) {
      if (deleteItem && list) {
        this.updateLayout(list, 0);
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
}
</style>
