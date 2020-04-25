<template>
  <div class="item">
    <img v-if="item.icon" :src="item.icon" />
    <box-icon size="34" v-else />
    <span class="item-text">{{ item.body }}</span>
  </div>
</template>

<script>
import { BoxIcon } from 'vue-feather-icons'

export default {
  name: "Item",
  components: {
    BoxIcon
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.item {
  background-color: #2c3e50;
  color: white;
  padding: 0.2rem;
  width: 200px;
  height: 40px;
  display: flex !important;
  border-radius: 2px;
  cursor: pointer;
  align-items: center;

  img,
  svg {
    min-width: 34px;
  }
}

.item-text {
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
