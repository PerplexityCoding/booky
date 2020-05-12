<template>
  <div
    :class="['quick-access', { 'has-transition': hasTransition , 'is-empty': items.length === 0 && !dragItemIn}]"
    @mouseleave="onMouseLeave"
    @mousenter="onMouseEnter"
  >
    <div class="empty-placeholder">
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
      :style="{ marginLeft: `${marginLeft}px` }"
      @drop="onCardDrop"
      @drag-enter="onDragEnter"
      @drag-leave="onDragLeave"
    >
      <smooth-dnd-draggable
        v-for="item in items"
        :key="`item-${item.id}`"
        class="dnd-item"
      >
        <item
          :item="item"
          :locked="locked"
          :display-delete-btn="!locked"
          :text-editable="!locked"
          class="item-quick-access"
          @delete-item="deleteItem"
        />
      </smooth-dnd-draggable>
    </smooth-dnd-container>
  </div>
</template>

<script>
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "@ymenard-dev/vue-smooth-dnd";
import { applyDrag } from "../utils/utils";
import { globalSet } from "../services/app/unique";
import Item from "./Item";

export default {
  name: "QuickAccess",
  components: {
    SmoothDndContainer,
    SmoothDndDraggable,
    Item,
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
      itemWidth: 95,
      dragItemIn: false,
      dragItem: null,
      placeholderOptions: {
        className: "quick-access-drop-preview",
        animationDuration: "150",
        showOnTop: true,
      },
      orientation: "horizontal",
      draggableInfo: null,
      originalDraggableInfoSize: null,
      originalGhostCenterDelta: null,
      resetTo: null,
      marginLeft: 35,
      hasTransition: false,
      recalcTo: null,
    };
  },
  mounted() {
    this.calcMarginLeft();
    setTimeout(() => {
      this.hasTransition = true;
    }, 0);
  },
  methods: {
    onMouseEnter() {
      if (this.recalcTo) {
        clearTimeout(this.recalcTo);
        this.recalcTo = null;
      }
    },
    onMouseLeave() {
      this.recalcTo = setTimeout(this.calcMarginLeft, 500);
    },
    calcMarginLeft() {
      const containerMargin = 60;
      this.marginLeft =
        (this.$el.offsetWidth -
          containerMargin -
          Math.max(250, this.items.length * (this.itemWidth + 12))) /
        2;
    },
    getCardPayloadFromTabsList() {
      return (index) => {
        return {
          item: {
            ...this.items[index],
          },
        };
      };
    },
    onDragEnter({ draggableInfo }) {
      if (!this.dragItemIn) {
        if (this.resetTo) {
          clearTimeout(this.resetTo);
          this.resetTo = null;
        } else {
          this.backupOriginalDrag(draggableInfo);
        }
        this.adaptDragInfo(draggableInfo, {
          itemWidth: this.itemWidth,
          itemHeight: this.itemWidth,
          center: true,
        });
        this.dragItemIn = true;
      }
      globalSet("dragQuickAccess", true);
    },
    onDragLeave({ draggableInfo }) {
      if (this.dragItemIn) {
        this.resetTo = setTimeout(() => {
          this.restoreDragInfo(draggableInfo);
        }, 100);
        this.dragItemIn = false;
      }
      globalSet("dragQuickAccess", false);
    },
    onCardDrop(dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const items = applyDrag(this.items, dropResult);
        this.dragItemIn = false;
        this.$emit("update:items", items);
      }
      setTimeout(() => {
        globalSet("dragQuickAccess", false);
      }, 1000);
    },
    deleteItem(item) {
      const items = this.items.filter((i) => i.id !== item.id);
      this.$emit("update:items", items);
    },
    adaptDragInfo(draggableInfo, { itemWidth, itemHeight, center } = {}) {
      draggableInfo.size.offsetWidth = itemWidth;
      if (center) {
        draggableInfo.ghostInfo.positionDelta.left = -(itemWidth / 2);
        draggableInfo.ghostInfo.centerDelta.x = 0;
        draggableInfo.ghostInfo.positionDelta.top = -(itemHeight / 2);
        draggableInfo.ghostInfo.centerDelta.y = 0;
      }
      const item = draggableInfo.ghostInfo.ghost.querySelector('.item');
      item.classList.add("item-quick-access");
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
        const item = draggableInfo.ghostInfo.ghost.querySelector('.item');
        item.classList.remove("item-quick-access");
      }
    },
  },
};
</script>

<style lang="scss">
@import "../styles/colors.scss";

.item.item-quick-access {
  background-color: lighten($primaryColor4, 15%);
  width: 95px;
  min-width: 95px;
  height: 90px;
  min-height: 90px;
  border-radius: 5px;
  padding: 8px;
  position: relative;
  flex-direction: column;
  text-decoration: none;

  .item-text {
    padding-top: 1px;
    flex: 1;
    display: flex;
    align-items: center;

    .input {
      text-align: center;
    }
  }

  .delete-btn {
    position: absolute;
    top: -12px;
    right: -12px;
    color: $fontColor;
  }
}
</style>

<style lang="scss" scoped>
@import "../styles/colors.scss";

.quick-access-container {
  border-collapse: separate;
  padding: 8px 30px;
  display: flex !important;
  min-width: calc(63px * 4);
  min-height: 55px;
  background-color: lighten($primaryColor4, 2%);
  border-radius: 5px;
}

.dnd-item {
  padding: 0 6px;
}

.quick-access {
  display: flex;
  align-items: center;
  background-color: $primaryColor4;

  &.has-transition .quick-access-container {
    transition: margin-left ease-out 0.2s;
  }
}

.empty-placeholder {
  border: 1px dashed $fontColor;
  font-size: 15px;
  position: absolute;
  padding: 20px;
  margin-left: calc(50% - 296px);
  display: none;
}

.is-empty {
  .quick-access-container {
    background-color: transparent;
  }

  .empty-placeholder {
    display: block;
  }
}
</style>
