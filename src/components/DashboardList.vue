<template>
  <dnd-grid-box
    :box-id="list.id"
    :resizable="false"
    drag-selector=".drag-handle"
    class="dashboard-list"
  >
    <header>
      <div class="item-title-text drag-handle">
        <text-input :value.sync="list.title" @update:value="$emit('change')" />
      </div>
      <button
        v-if="!locked"
        class="delete-btn"
        @click="$emit('delete-list', list.id)"
      >
        <x-circle-icon />
      </button>
    </header>
    <div v-if="list.items.length === 0 && !dragItemIn" class="empty-placeholder">
      Drag your book here !
    </div>
    <smooth-dnd-container
      group-name="tabs"
      :get-child-payload="getCardPayload"
      :drop-placeholder="upperDropPlaceholderOptions"
      class="dnd-list-container"
      @drop="onCardDrop"
      @drag-start="onDragStart"
      @drag-enter="onDragEnter"
      @drag-leave="onDragLeave"
      @drag-end="dragItemIn = false"
    >
      <smooth-dnd-draggable
        v-for="item in list.items"
        :key="item.id"
        class="dashboard-draggable-item"
      >
        <a :href="item.href">
          <item
            :item="item"
            :display-delete-btn="!locked"
            @delete-item="deleteItem"
          />
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
import TextInput from "./atoms/TextInput";

export default {
  name: "DashboardList",
  components: {
    TextInput,
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
    locked: {
      type: Boolean,
      required: true,
    },
    boxId: {
      type: String,
      required: true,
    },
  },
  data: function () {
    return {
      dragItemIn: false,
      isDraggingSource: false,
      upperDropPlaceholderOptions: {
        className: "cards-drop-preview",
        animationDuration: "150",
        showOnTop: true,
      },
    };
  },
  methods: {
    onDragEnter() {
      this.dragItemIn = true;
      this.$emit('card-enter', this.list, this.isDraggingSource);
    },
    onDragLeave() {
      this.dragItemIn = false;
      this.$emit('card-leave', this.list, this.isDraggingSource);
    },
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
        id: uuidv4(),
      };
    },
    onCardDrop(dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        let list = this.list;
        list.items = applyDrag(list.items, dropResult);
        this.$emit("card-drop", list);
      }
    },
    deleteItem(item) {
      const items = this.list.items.filter((i) => i.id !== item.id);
      const newList = {
        ...this.list,
        items,
      };

      this.$emit("update:list", newList);
      this.$emit("change", { list: newList, deleteItem: true });
    },
  },
};
</script>

<style lang="scss">
@import "../styles/colors.scss";

.cards-drop-preview {
  background-color: lighten($purpleColor4, 10%);
  border: 1px dashed $white;
  margin-top: 5px;
}
</style>

<style lang="scss" scoped>
@import "../styles/colors.scss";

.dashboard-list {
  background-color: lighten($purpleColor4, 15%);
  padding: 5px;
  border-radius: 2px;

  .dnd-list-container {
    min-height: 45px;
  }

  & header {
    height: 25px;
    display: flex;

    & .item-title-text {
      flex: 1;
      text-align: left;
      line-height: 25px;
      font-size: 14px;
      color: $purpleColor5;
      width: 100%;
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

  .empty-placeholder {
    border: 1px dashed $white;
    height: 39px;
    line-height: 36px;
    font-size: 15px;
    margin-top: 5px;
    position: absolute;
    width: 195px;
  }
}
</style>
