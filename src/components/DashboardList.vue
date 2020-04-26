<template>
  <dnd-grid-box
    :box-id="list.id"
    :resizable="false"
    drag-selector=".drag-handle"
    class="dashboard-list"
  >
    <header>
      <div class="item-title-text drag-handle">
        {{ list.title }}
      </div>
      <button class="delete-btn" @click="$emit('delete-list', list.id)">
        <x-circle-icon />
      </button>
    </header>
    <smooth-dnd-container
      group-name="tabs"
      :get-child-payload="getCardPayload"
      :drop-placeholder="upperDropPlaceholderOptions"
      @drop="onCardDrop"
      @drag-start="onDragStart"
      @drag-enter="$emit('card-enter', list, isDraggingSource)"
      @drag-leave="$emit('card-leave', list, isDraggingSource)"
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
import { XCircleIcon } from "vue-feather-icons";
import Item from "./Item";

export default {
  name: "DashboardList",
  components: {
    DndGridBox,
    SmoothDndContainer,
    SmoothDndDraggable,
    Item,
    XCircleIcon,
  },
  props: {
    list: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      isDraggingSource: false,
      upperDropPlaceholderOptions: {
        className: "cards-drop-preview",
        animationDuration: "150",
        showOnTop: true,
      },
    };
  },
  methods: {
    onDragStart(dragResult) {
      this.isDraggingSource = dragResult.isSource;
      if (dragResult.isSource) {
        this.$emit("drag-start");
      }
    },
    getCardPayload(index) {
      const item = this.list.items[index];
      return {
        ...item,
        id: uuidv4()
      };
    },
    onCardDrop(dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        let list = this.list;
        list.items = applyDrag(list.items, dropResult);
        this.$emit("card-drop", list);
      }
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
@import "../styles/colors.scss";

.dashboard-list {
  background-color: lighten($purpleColor4, 15%);
  padding: 5px;
  border-radius: 2px;

  & header {
    height: 25px;
    display: flex;

    & .item-title-text {
      flex: 1;
      text-align: left;
      line-height: 25px;
      font-size: 14px;
      color: $purpleColor5;
    }

    & .delete-btn {
      color: $white;

      &:hover {
        color: #ff3c3f;
      }
    }
  }

  .dashboard-draggable-item {
    border-radius: 2px;
    color: $white;
    padding-top: 5px;

    a {
      color: $white;
      text-decoration: none;
    }
  }

  .grid-container {
    flex: 1;
  }
}
</style>
