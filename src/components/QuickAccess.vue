<template>
  <div
    class="quick-access"
  >
    <div v-if="items.length === 0 && !dragItemIn" class="empty-placeholder">
      Drag your quick access book here !
    </div>
    <smooth-dnd-container
      group-name="tabs"
      class="quick-access-container"
      :should-accept-drop="() => !locked"
      :drag-handle-selector="locked ? '.none' : ''"
      :get-child-payload="getCardPayloadFromTabsList()"
      :drop-placeholder="placeholderOptions"
      :orientation="orientation"
      drag-class="super-class"
      drop-class="toto-class"
      lock-axis="x"
      @drop="onCardDrop"
      @drag="onDrag"
      @drag-end="onDragEnd"
      @drag-enter="onDragEnter"
      @drag-leave="onDragLeave"
    >
      <smooth-dnd-draggable
        v-for="item in items"
        :key="`item-${item.id}`"
        class="item"
      >
        <a :href="item.href">
          <img v-if="item.icon" :src="item.icon" />
          <box-icon v-else size="40" />
        </a>
        <button v-if="!locked" class="delete-btn" @click="deleteItem(item)">
          <x-circle-icon />
        </button>
      </smooth-dnd-draggable>
    </smooth-dnd-container>
  </div>
</template>

<script>
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "vue-smooth-dnd";
import { BoxIcon, XCircleIcon } from "vue-feather-icons";
import {applyDrag, debounce, uuidv4} from "../utils/utils";

export default {
  name: "QuickAccess",
  components: {
    SmoothDndContainer,
    SmoothDndDraggable,
    BoxIcon,
    XCircleIcon,
  },
  props: {
    locked: {
      type: Boolean,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      mode: "tabs",
      itemWidth: 55,
      dragItemIn: false,
      dragItem: null,
      placeholderOptions: {
        className: "quick-access-drop-preview",
        animationDuration: "150",
        showOnTop: true,
      },
      orientation: "horizontal",
      draggableInfo: null,
      originalDraggableInfoWidth: null,
      ghostInfo: null,
      originalGhostInfoLeft: null,
      originalGhostCenterDeltaX: null,
      resetTo: null,
    };
  },
  methods: {
    getCardPayloadFromTabsList() {
      return (index) => {
        return {
          item: {
            ...this.items[index],
          },
        };
      };
    },
    onDrag(o) {
      console.log(o);
    },
    onDragEnd() {
      this.draggableInfo = null;
      this.ghostInfo = null;
    },
    onDragEnter({ draggableInfo }) {
      if (!this.dragItemIn) {
        this.adaptDragInfo(draggableInfo, this.itemWidth, {center: true});
        this.dragItemIn = true;
      }
    },
    onDragLeave({ draggableInfo }) {
      if (this.dragItemIn) {
        this.restoreDragInfo(draggableInfo);
        this.dragItemIn = false;
      }
    },
    onCardDrop(dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const items = applyDrag(this.items, dropResult);
        this.$emit("update:items", items);
      }
    },
    deleteItem(item) {
      const items = this.items.filter((i) => i.id !== item.id);
      this.$emit("update:items", items);
    },
    adaptDragInfo(draggableInfo, itemWidth, {center} = {}) {
      this.backupOriginalDrag(draggableInfo);
      draggableInfo.size.offsetWidth = itemWidth;
      if (center) {
        draggableInfo.ghostInfo.positionDelta.left = -(itemWidth / 2);
        draggableInfo.ghostInfo.centerDelta.x = 0;
      }
      draggableInfo.ghostInfo.ghost.classList.add("item-quick-access");
    },
    backupOriginalDrag(draggableInfo) {
      this.draggableInfo = draggableInfo;
      this.originalDraggableInfoWidth = draggableInfo.size.offsetWidth;
      this.originalGhostInfoLeft = draggableInfo.ghostInfo.positionDelta.left;
      this.originalGhostCenterDeltaX = draggableInfo.ghostInfo.centerDelta.x;
    },
    restoreDragInfo(draggableInfo) {
      if (draggableInfo) {
        draggableInfo.size.offsetWidth = this.originalDraggableInfoWidth;
        draggableInfo.ghostInfo.positionDelta.left = this.originalGhostInfoLeft;
        draggableInfo.ghostInfo.centerDelta.x = this.originalGhostCenterDeltaX;
        draggableInfo.ghostInfo.ghost.classList.remove("item-quick-access");
      }
    },
  },
};
</script>

<style lang="scss">
@import "../styles/colors.scss";

.item-quick-access {
  .item {
    background-color: lighten($purpleColor4, 15%);
    width: 55px;
    height: 55px;
    border-radius: 5px;
    padding: 8px;

    .delete-btn,
    .item-text {
      display: none;
    }

    img,
    svg {
      min-width: 40px;
      max-width: 40px;
    }
  }
}
</style>

<style lang="scss" scoped>
@import "../styles/colors.scss";

.quick-access-container {
  border-collapse: separate;
  padding: 8px 6px;
  display: flex;
}

.quick-access {
  display: flex;
  justify-content: center;
  align-items: center;
}

.delete-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  color: $white;
}

img,
svg {
  min-width: 40px;
  max-width: 40px;
}

.item {
  padding: 0 4px;
  position: relative;

  a {
    display: block;
    color: $white;
    background-color: lighten($purpleColor4, 15%);
    height: 55px;
    width: 55px;
    padding: 6px;
    border-radius: 5px;

    &:hover {
      background-color: lighten($purpleColor4, 25%);
    }
  }
}

.empty-placeholder {
  border: 1px dashed $white;
  font-size: 15px;
  position: absolute;
  padding: 10px;
}
</style>
