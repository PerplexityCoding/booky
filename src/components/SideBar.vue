<template>
  <smooth-dnd-container
    behaviour="copy"
    group-name="tabs"
    :should-accept-drop="() => false"
    :get-child-payload="getCardPayloadFromTabsList()"
  >
    <smooth-dnd-draggable
      v-for="tab in tabs"
      :key="`tab-${tab.id}`"
      class="tab-item"
    >
      <img v-if="tab.icon" :src="tab.icon" />
      <box-icon v-else />
      <span>{{ tab.body }}</span>
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
}
</style>
