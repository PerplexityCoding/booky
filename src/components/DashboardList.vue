<template>
  <dnd-grid-box
    :box-id="list.id"
    :data-id="list.id"
    :resizable="false"
    drag-selector=".drag-handle *"
    class="dashboard-list"
    :class="{ 'is-hover': isHover }"
    @mouseenter.native="isHover = true"
    @mouseleave.native="isHover = false"
  >
    <header class="drag-handle">
      <div class="item-title-text">
        <text-input
          :value.sync="list.title"
          :should-be-editable="!isDragging && !(listLocked && locked)"
          @update:value="$emit('change:list', { list })"
        />
      </div>
      <button
        v-if="!locked"
        class="delete-btn"
        @click="$emit('delete-list', list.id)"
      >
        <x-circle-icon :size="iconSize" />
      </button>
      <button
        class="lock-btn"
        :class="{ 'lock-btn-unlocked': !listLocked || !locked }"
        @click="toggleLock"
      >
        <lock-icon :size="iconSize" v-if="listLocked && locked" />
        <unlock-icon :size="iconSize" v-else />
      </button>
    </header>
    <div
      v-if="list.items.length === 0 && !dragItemIn && !locked && !listLocked"
      class="empty-placeholder"
    >
      Drag your book here
    </div>
    <smooth-dnd-container
      group-name="tabs"
      :get-child-payload="getCardPayload"
      :drop-placeholder="placeholderOptions"
      :drag-handle-selector="locked && listLocked ? '.none' : ''"
      :should-accept-drop="shouldAcceptDrop"
      class="dnd-list-container"
      @drop="onCardDrop"
      @drag-start="onDragStart"
      @drag-enter="onDragEnter"
      @drag-leave="onDragLeave"
      @drag-end="onDragEnd()"
    >
      <smooth-dnd-draggable
        v-for="item in list.items"
        :key="item.id"
        class="dashboard-draggable-item"
      >
        <item
          :item="item"
          :locked="locked || !listLocked"
          :display-delete-btn="!locked || !listLocked"
          :text-editable="!locked || !listLocked"
          :link-clickable="locked || !listLocked"
          @delete-item="deleteItem"
          @change="$emit('change:list', { list })"
        />
      </smooth-dnd-draggable>
    </smooth-dnd-container>
  </dnd-grid-box>
</template>

<script>
import { uuidv4, applyDrag, debounce } from "../utils/utils";
import { Box as DndGridBox } from "./dnd-grid";
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "@ymenard-dev/vue-smooth-dnd";
import { XCircleIcon, LockIcon, UnlockIcon } from "vue-feather-icons";
import Item from "./Item";
import TextInput from "./atoms/TextInput";
import { globalGet } from "../services/app/unique";

export default {
  name: "DashboardList",
  components: {
    TextInput,
    DndGridBox,
    SmoothDndContainer,
    SmoothDndDraggable,
    Item,
    XCircleIcon,
    LockIcon,
    UnlockIcon,
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
    isDragging: {
      type: Boolean,
      default: false,
    },
    itemWidth: {
      type: Number,
      required: true,
    },
  },
  data: function () {
    return {
      listLocked: true,
      dragItemIn: false,
      isDraggingSource: false,
      placeholderOptions: {
        className: "cards-drop-preview",
        animationDuration: "150",
        showOnTop: true,
      },
      isHover: false,
      iconSize: "20",
    };
  },
  methods: {
    shouldAcceptDrop(src, payload) {
      if (
        payload.from === "stash" ||
        payload.from === "tabs" ||
        payload.unlocked
      ) {
        return true;
      }
      return !this.locked || !this.listLocked;
    },
    onDragEnter({ draggableInfo }) {
      this.dragItemIn = true;
      this.adaptDragInfo(draggableInfo, {
        itemWidth: this.itemWidth,
        itemHeight: 40,
        center: true,
      });
      this.$emit("card-enter", this.list, this.isDraggingSource);
    },
    onDragLeave({ draggableInfo }) {
      this.dragItemIn = false;
      this.restoreDragInfo(draggableInfo);
      this.$emit("card-leave", this.list, this.isDraggingSource);
    },
    onDragStart(dragResult) {
      this.isDraggingSource = dragResult.isSource;
      if (dragResult.isSource) {
        this.$emit("drag-start");
      }
    },
    onDragEnd: debounce(function () {
      this.dragItemIn = false;
      this.$emit("drag-end");
    }, 0),
    getCardPayload(index) {
      const item = this.list.items[index];
      return {
        item: {
          ...item,
          id: uuidv4(),
        },
        unlocked: this.locked || this.listLocked,
      };
    },
    onCardDrop(dropResult) {
      if (
        !globalGet("dragQuickAccess") &&
        (dropResult.removedIndex !== null || dropResult.addedIndex !== null)
      ) {
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
      this.$emit("change:list", { list: newList, deleteItem: true });
    },
    adaptDragInfo(draggableInfo, { itemWidth, itemHeight, center } = {}) {
      this.backupOriginalDrag(draggableInfo);
      const size = draggableInfo.size;
      const ratio = 1 - (size.offsetWidth - itemWidth) / size.offsetWidth;
      draggableInfo.size.offsetWidth = itemWidth;
      if (center) {
        draggableInfo.ghostInfo.positionDelta.left =
          draggableInfo.ghostInfo.positionDelta.left * ratio;
        draggableInfo.ghostInfo.centerDelta.x =
          draggableInfo.ghostInfo.centerDelta.x * ratio;
      }
      draggableInfo.ghostInfo.ghost.style.width = `${itemWidth - 5}px`;
      //draggableInfo.ghostInfo.ghost.classList.remove("item-quick-access-ghost");
    },
    backupOriginalDrag(draggableInfo) {
      this.draggableInfo = draggableInfo;
      this.originalDraggableInfoWidth = draggableInfo.size.offsetWidth;
      this.originalDraggableInfoSize = {
        ...draggableInfo.ghostInfo.positionDelta,
      };
      this.originalGhostCenterDelta = {
        ...draggableInfo.ghostInfo.centerDelta,
      };
    },
    restoreDragInfo(draggableInfo) {
      if (draggableInfo) {
        draggableInfo.size.offsetWidth = this.originalDraggableInfoWidth;
        draggableInfo.ghostInfo.positionDelta = this.originalDraggableInfoSize;
        draggableInfo.ghostInfo.centerDelta = this.originalGhostCenterDelta;
        draggableInfo.ghostInfo.ghost.style.width = `${this.originalDraggableInfoWidth}px`;
      }
    },
    toggleLock() {
      this.listLocked = !this.listLocked;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/mixins.scss";

.dashboard-list {
  @include backgroundColor(--primary-color2);
  padding: 6px 8px;
  border-radius: 4px;

  .dnd-list-container {
    min-height: 45px;
  }

  & header {
    height: 25px;
    display: flex;
    cursor: grab;

    & .item-title-text {
      flex: 1;
      text-align: left;
      line-height: 25px;
      @include fontColor(--font-color-white);
      width: 100%;

      ::v-deep .input {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.05rem;
        @include fontColor(--accent);
      }
    }

    & .delete-btn {
      @include fontColor(--font-color-white);
      margin-right: 4px;

      &:hover {
        color: var(--red);
      }
    }
  }

  .dashboard-draggable-item {
    border-radius: 4px;
    @include fontColor(--font-color);
    padding-top: 8px;

    a {
      @include fontColor(--font-color);
      text-decoration: none;
    }
  }

  .grid-container {
    flex: 1;
  }

  .empty-placeholder {
    @include backgroundColor(--primary-color2, 12%);
    @include fontColor(--font-color-white);
    height: 45px;
    line-height: 41px;
    font-size: 15px;
    margin-top: 5px;
    position: absolute;
    width: calc(100% - 10px);
  }

  .lock-btn {
    display: none;
    @include fontColor(--font-color-white);

    &-unlocked {
      display: block;
    }
  }

  &.is-hover {
    .lock-btn {
      display: block;
    }
  }
}
</style>
