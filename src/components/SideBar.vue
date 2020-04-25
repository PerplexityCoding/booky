<template>
  <smooth-dnd-container
    behaviour="copy"
    group-name="tabs"
    class="side-bar-container"
    :should-accept-drop="() => false"
    :get-child-payload="getCardPayloadFromTabsList()"
  >
    <smooth-dnd-draggable
      v-for="tab in tabs"
      :key="`tab-${tab.id}`"
      class="tab-item"
    >
      <img v-if="tab.icon" :src="tab.icon" />
      <box-icon size="34" v-else />
      <span class="tab-item-text">{{ tab.body }}</span>
    </smooth-dnd-draggable>
  </smooth-dnd-container>
</template>

<script>
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "vue-smooth-dnd";
import { BoxIcon } from 'vue-feather-icons'

export default {
  name: "SideBar",
  components: {
    SmoothDndContainer,
    SmoothDndDraggable,
    BoxIcon
  },
  props: {
    tabs: {
      type: Array,
      required: true,
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
.side-bar-container {
  height: calc(100vh - 30px);
  overflow: auto;
}

.tab-item {
  background-color: #2c3e50;
  color: white;
  padding: 0.2rem;
  width: 200px;
  height: 40px;
  margin: 5px;
  display: flex !important;
  border-radius: 2px;
  cursor: pointer;
  align-items: center;

  img,
  svg {
    min-width: 34px;
  }

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.tab-item-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 16px;
  margin: 0 3px;
  width: 100%;
  text-align: left;
}
</style>
