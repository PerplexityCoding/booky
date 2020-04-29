<template>
  <div>
    <header>
      <button :class="{ active: tabsMode }" @click="mode = 'tabs'">Tabs</button>
      <button :class="{ active: stashMode }" @click="mode = 'stash'">
        Stash
      </button>
    </header>
    <section>
      <smooth-dnd-container
        group-name="tabs"
        class="side-bar-container"
        :should-accept-drop="shouldDndDrop"
        :drag-handle-selector="locked ? '.none' : ''"
        :get-child-payload="getCardPayloadFromTabsList()"
        :drop-placeholder="placeholderOptions"
        :behaviour="dndBehavior"
        @drop="onCardDrop"
      >
        <smooth-dnd-draggable
          v-for="item in items"
          :key="`item-${item.id}`"
          class="item"
        >
          <item
            :item="item"
            :text-editable="stashMode && !locked"
            :display-delete-btn="!locked"
            @change="$emit('change')"
            @delete-item="
              (item) => (stashMode ? deleteItem(item) : closeTab(item))
            "
          />
        </smooth-dnd-draggable>
      </smooth-dnd-container>
    </section>
  </div>
</template>

<script>
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "vue-smooth-dnd";
import Item from "./Item";
import { applyDrag, uuidv4 } from "../utils/utils";

export default {
  name: "SideBar",
  components: {
    SmoothDndContainer,
    SmoothDndDraggable,
    Item,
  },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    stash: {
      type: Array,
      required: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mode: "tabs",
      placeholderOptions: {
        className: "cards-drop-preview",
        animationDuration: "150",
        showOnTop: true,
      },
    };
  },
  computed: {
    tabsMode() {
      return this.mode === "tabs";
    },
    stashMode() {
      return this.mode === "stash";
    },
    items() {
      return this.mode === "tabs" ? this.tabs : this.stash;
    },
    dndBehavior() {
      return this.mode === "tabs" ? "move" : "move";
    },
  },
  methods: {
    shouldDndDrop(item) {
      console.log(this.mode);
      return this.mode === "stash";
    },
    getCardPayloadFromTabsList() {
      return (index) => {
        return {
          ...this.items[index],
          id: uuidv4(),
        };
      };
    },
    onCardDrop(dropResult) {
      if (this.mode !== "stash") {
        return;
      }

      const stash = applyDrag(this.items, dropResult);
      this.updateStash(stash);
    },
    closeTab(item) {
      const idx = this.items.indexOf(item);
      if (idx >= 0) {
        this.items.splice(idx, 1);
        chrome.tabs.remove(item.tabId);
      }
    },
    deleteItem(item) {
      if (this.mode !== "stash") {
        return;
      }
      const idx = this.items.indexOf(item);
      if (idx >= 0) {
        this.items.splice(idx, 1);
        this.updateStash(this.items);
      }
    },
    updateStash(stash) {
      this.$emit("update:stash", stash);
      this.$emit("change");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/colors.scss";

button {
  background-color: lighten($purpleColor4, 5%);
  color: $purpleColor5;
  text-transform: uppercase;
  letter-spacing: 0.25rem;
  border-radius: 5px;
  width: 40%;
  line-height: 25px;

  &.active {
    background-color: lighten($purpleColor4, 15%);
  }
}

header {
  display: flex;
  justify-content: space-evenly;
  padding: 10px 0;
}

.side-bar-container {
  height: calc(100vh - 30px);
  overflow: auto;
  padding: 0 3px;
}

.item {
  padding: 2px;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }
}
</style>
