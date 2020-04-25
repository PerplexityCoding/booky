<template>
  <dnd-grid-box
    :box-id="list.id"
    :resizable="true"
    drag-selector="header"
    class="box-item"
  >
    <header>
      {{ list.title }}
      <button @click="$emit('delete-list', list.id)">Delete list</button>
    </header>
    <smooth-dnd-container
      group-name="tabs"
      :get-child-payload="getCardPayload"
      drop-placeholder
      @drop="onCardDrop"
    >
      <smooth-dnd-draggable
        v-for="item in list.items"
        :key="item.id"
        class="dashboard-item"
      >
        <a :href="item.href">
          <img v-if="item.icon" :src="item.icon" />
          <box-icon v-else />
          <span>{{ item.body }}</span>
        </a>
      </smooth-dnd-draggable>
    </smooth-dnd-container>
    <button @click="addItem()">Add new empty item</button>
  </dnd-grid-box>
</template>

<script>
import { uuidv4, applyDrag } from "../utils/utils";
import { Box as DndGridBox } from "./dnd-grid";
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "vue-smooth-dnd";
import { BoxIcon } from 'vue-feather-icons'

export default {
  name: "DashboardList",
  components: {
    BoxIcon,
    DndGridBox,
    SmoothDndContainer,
    SmoothDndDraggable,
  },
  props: {
    list: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getCardPayload(index) {
      return this.list.items[index];
    },
    onCardDrop(dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        let list = this.list;
        list.items = applyDrag(list.items, dropResult);
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

<style lang="scss" scoped>
.box-item {
  height: 100px;
  width: 100px;
  background-color: grey;
}

.dashboard-item {
  background-color: #4A4A4A;
  margin: 5px;
  border-radius: 2px;
  color: white;

  a {
    color: white;
  }
}

.grid-container {
  flex: 1;
}
</style>
