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
        behaviour="dndBehavior"
        group-name="tabs"
        class="side-bar-container"
        :should-accept-drop="() => false"
        :drag-handle-selector="locked ? '.none' : ''"
        :get-child-payload="getCardPayloadFromTabsList()"
      >
        <smooth-dnd-draggable
          v-for="item in items"
          :key="`item-${item.id}`"
          class="item"
        >
          <item :item="item" />
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
      return this.mode === "tabs" ? "move" : "copy";
    },
  },
  methods: {
    getCardPayloadFromTabsList() {
      return (index) => {
        return this.tabs[index];
      };
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
