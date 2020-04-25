<template>
  <dnd-grid-container
    :layout.sync="myLayout"
    :cell-size="cellSize"
    :max-column-count="12"
    :outer-margin="5"
    class="grid-container"
  >
    <dnd-grid-box
      v-for="list in lists"
      :key="'dnd-box-' + list.id"
      :box-id="list.id"
      :resizable="true"
      drag-selector="header"
      class="box-item"
    >
      <header>
        {{ list.title }}
        <button @click="deleteList(list.id)">Delete list</button>
      </header>
      <smooth-dnd-container
        group-name="tabs"
        :get-child-payload="getCardPayload(list.id)"
        drop-placeholder
        @drop="(e) => onCardDrop(list.id, e)"
      >
        <smooth-dnd-draggable
          v-for="item in list.items"
          :key="item.id"
          class="tab-item"
        >
          <a :href="item.href">{{ item.body }}</a>
        </smooth-dnd-draggable>
      </smooth-dnd-container>
      <button @click="addItem(list)">Add new empty item</button>
    </dnd-grid-box>
  </dnd-grid-container>
</template>

<script>
import { uuidv4, applyDrag } from "../utils/utils";
import { Container as DndGridContainer, Box as DndGridBox } from "./dnd-grid";
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "vue-smooth-dnd";

export default {
  name: "Dashboard",
  components: {
    DndGridBox,
    DndGridContainer,
    SmoothDndContainer,
    SmoothDndDraggable,
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
  watch: {
    myLayout() {
      this.$emit('update:layout', this.myLayout);
    },
  },
  data() {
    return {
      myLayout: this.layout,
      cellSize: {
        h: 100,
        w: 200,
      },
    };
  },
  methods: {
    deleteList(id) {
      const lists = this.lists.filter((i) => i.id != id);
      this.saveLists(lists);

      const newLayout = this.layout.filter((i) => i.id != id);
      this.$emit("update:layout", newLayout);
    },
    getList(id) {
      return this.lists.filter((list) => list.id === id)[0];
    },
    getCardPayload(listId) {
      return (index) => {
        let list = this.getList(listId);
        return list.items[index];
      };
    },
    onCardDrop(listId, dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        let list = this.getList(listId);
        list.items = applyDrag(list.items, dropResult);
      }
    },
    addItem(list, item) {
      if (!item) {
        item = {
          id: uuidv4(),
          body: "Empty",
        };
      }

      if (!list.items) {
        list.items = [];
      }

      list.items.push(item);

      this.saveLists();
    },
    saveLists(lists = this.lists) {
      this.$emit("update:lists", lists);
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
