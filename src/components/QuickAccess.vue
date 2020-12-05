<template>
  <div
    :class="[
      'quick-access',
      {
        'has-transition': hasTransition,
        'is-empty': items.length === 0 && !dragItemIn,
      },
    ]"
    @mouseleave="onMouseLeave"
    @mouseenter="onMouseEnter"
  >
    <div class="empty-placeholder">
      Drag your quick access book here !
    </div>
    <smooth-dnd-container
      ref="container"
      group-name="tabs"
      class="quick-access-container"
      :should-accept-drop="shouldAcceptDrop"
      :drag-handle-selector="locked ? '.none' : ''"
      :get-child-payload="getCardPayloadFromTabsList()"
      :drop-placeholder="placeholderOptions"
      :orientation="orientation"
      :style="containerStyle"
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
          :link-clickable="locked"
          class="item-quick-access"
          @delete-item="deleteItem"
          @change="$emit('update:items', items)"
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
import { applyDrag, throttle } from "../utils/utils";
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
      hasTransition: false,
      recalcTimeout: null,
      recalDelay: 100,
      containerStyle: null,
    };
  },
  mounted() {
    setTimeout(() => {
      this.hasTransition = true;
    }, 0);
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
      return !this.locked;
    },
    onMouseEnter() {
      if (this.recalcTimeout) {
        clearTimeout(this.recalcTimeout);
        this.recalcTimeout = null;
      } else {
        const clientRect = this.$refs.container.$el.getBoundingClientRect();
        this.containerStyle = {
          marginLeft: `${clientRect.left}px`,
        };
      }
    },
    onMouseLeave() {
      this.recalcTimeout = setTimeout(() => {
        this.containerStyle = null;
        this.recalcTimeout = null;
      }, this.recalDelay);
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
        const itemSize = this.itemWidth;
        this.adaptDragInfo(draggableInfo, {
          itemWidth: itemSize,
          itemHeight: itemSize,
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
      const item = draggableInfo.ghostInfo.ghost.querySelector(".item");
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
        const item = draggableInfo.ghostInfo.ghost.querySelector(".item");
        item.classList.remove("item-quick-access");
      }
    },
  },
};
</script>

<style lang="scss">
@import "../styles/mixins.scss";

.item.item-quick-access {
  @include backgroundColor(--primary-color3, -15%);
  @include fontColor(--font-color-white);
  width: 95px;
  min-width: 95px;
  height: 90px;
  min-height: 90px;
  border-radius: 5px;
  padding: 8px;
  position: relative;
  flex-direction: column;
  text-decoration: none;

  &:hover {
    @include backgroundColor(--primary-color3, 10%, 30%);
  }

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
    top: 0;
    right: 0;
    @include fontColor(--font-color-white);

    &:hover {
      @include fontColor(--red);
    }
  }
}
</style>

<style lang="scss" scoped>
@import "../styles/mixins.scss";

.quick-access-container {
  border-collapse: separate;
  padding: 8px 30px;
  display: flex !important;
  min-width: calc(63px * 4);
  min-height: 55px;
  @include backgroundColor(--primary-color1, -3%, 10%);
  border-radius: 5px;
  margin: 0 auto;
}

.dnd-item {
  padding: 0 6px;
}

.quick-access {
  display: flex;
  align-items: center;
  @include backgroundColor(--primary-color1);
  position: relative;

  &.has-transition .quick-access-container {
    transition: margin-left ease-out 0.2s;
  }
}

.empty-placeholder {
  @include fontColor(--font-color-black, --font-color-white);
  border: 1px dashed var(--font-color);
  font-size: 15px;
  position: absolute;
  padding: 20px;
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
