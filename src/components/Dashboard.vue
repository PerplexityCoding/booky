<template>
  <dnd-grid-container
    :layout.sync="myLayout"
    :cell-size="cellSize"
    :max-column-count="maxColumnCount"
    :outer-margin="0"
    :default-size="defaultSize"
    class="grid-container"
  >
    <dashboard-list
      v-for="list in lists"
      :key="'dnd-box-' + list.id"
      :list="list"
      @card-drop="cardDrop"
      @delete-list="deleteList"
    />
  </dnd-grid-container>
</template>

<script>
import { Container as DndGridContainer } from "./dnd-grid";
import DashboardList from "./DashboardList";
import {fixLayout} from "./dnd-grid/utils";

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
  },
  data() {
    return {
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
  methods: {
    deleteList(id) {
      const lists = this.lists.filter((i) => i.id !== id);
      this.saveLists(lists);

      this.myLayout = this.myLayout.filter((i) => i.id !== id);
      this.$emit("update:layout", this.myLayout);
    },
    saveLists(lists = this.lists) {
      this.$emit("update:lists", lists);
    },
    cardDrop(list) {
      const listLayout = this.myLayout.filter((i) => i.id === list.id)[0];
      listLayout.position.h = Math.max(list.items.length + 1, 2);
      this.myLayout = fixLayout(this.myLayout);
      this.$emit("update:layout", this.myLayout);
    },
  },
};
</script>

<style lang="scss" scoped>
.box-item {
  height: 100px;
  width: 100px;
  background-color: grey;
}

.grid-container {
  flex: 1;
}
</style>
