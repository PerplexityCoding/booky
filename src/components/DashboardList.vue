<template>
  <dnd-grid-box
    :box-id="list.id"
    :resizable="true"
    drag-selector="header"
    class="dashboard-list"
  >
    <header>
      {{ list.title }}
      <button @click="$emit('delete-list', list.id)">Delete list</button>
    </header>
    <smooth-dnd-container
      group-name="tabs"
      :get-child-payload="getCardPayload"
      :drop-placeholder="upperDropPlaceholderOptions"
      @drop="onCardDrop"
    >
      <smooth-dnd-draggable
        v-for="item in list.items"
        :key="item.id"
        class="dashboard-draggable-item"
      >
        <a :href="item.href">
          <item :item="item" />
        </a>
      </smooth-dnd-draggable>
    </smooth-dnd-container>
  </dnd-grid-box>
</template>

<script>
import { uuidv4, applyDrag } from "../utils/utils";
import { Box as DndGridBox } from "./dnd-grid";
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "vue-smooth-dnd";
import Item from "./Item";

export default {
  name: "DashboardList",
  components: {
    DndGridBox,
    SmoothDndContainer,
    SmoothDndDraggable,
    Item,
  },
  props: {
    list: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      upperDropPlaceholderOptions: {
        className: "cards-drop-preview",
        animationDuration: "150",
        showOnTop: true,
      },
    };
  },
  methods: {
    getCardPayload(index) {
      return this.list.items[index];
    },
    onCardDrop(dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        let list = this.list;
        list.items = applyDrag(list.items, dropResult);
        this.$emit('card-drop', list);
      }
    },
    addItem(item) {
      const list = this.list;
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
    },
  },
};
</script>

<style>
.cards-drop-preview {
  background-color: rgba(150, 150, 200, 0.1);
  border: 1px dashed #abc;
  margin-top: 5px;
}
</style>

<style lang="scss" scoped>
.dashboard-list {
  background-color: grey;
  padding: 5px;
  border-radius: 2px;

  & header {
    display: block;
    height: 25px;
  }
}

.dashboard-draggable-item {
  border-radius: 2px;
  color: white;
  padding-top: 5px;

  a {
    color: white;
  }
}

.grid-container {
  flex: 1;
}
</style>
