<template>
  <component :is="item.href && locked ? 'a' : 'div'" :href="item.href" class="item">
    <icon class="item-icon" :src="item.icon" />

    <span class="item-text">
      <text-input
        :value.sync="item.body"
        :should-be-editable="textEditable"
        @update:value="$emit('change')"
        @click.native="onInputClick"
      />
    </span>
    <button
      v-if="displayDeleteBtn"
      class="delete-btn"
      @click.prevent.stop="$emit('delete-item', item)"
    >
      <x-circle-icon />
    </button>
  </component>
</template>

<script>
import { XCircleIcon } from "vue-feather-icons";
import TextInput from "./atoms/TextInput";
import Icon from "./atoms/Icon";

export default {
  name: "Item",
  components: {
    XCircleIcon,
    TextInput,
    Icon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    displayDeleteBtn: {
      type: Boolean,
      default: false,
    },
    textEditable: {
      type: Boolean,
      default: false,
    },
    locked: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onInputClick(e) {
      if (this.textEditable) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/mixins";

.item {
  background-color: lightness(var(--primary-color2), 0.88);
  color: var(--font-color);
  padding: 6px;
  width: 100%;
  min-width: 150px;
  height: 44px;
  display: flex !important;
  border-radius: 2px;
  cursor: pointer;
  align-items: center;

  &:hover {
    background-color: lightness(var(--primary-color2), 0.95);
  }
}

.item-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 16px;
  margin: 0 3px 0 5px;
  width: 100%;
  text-align: left;
}

.delete-btn {
  color: var(--font-color);

  &:hover {
    color: #ff3c3f;
  }
}
</style>
