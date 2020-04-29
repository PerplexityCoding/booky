<template>
  <div class="item">
    <img v-if="item.icon" :src="item.icon" />
    <box-icon v-else size="34" />
    <span class="item-text">
      <text-input
        :value.sync="item.body"
        :should-be-editable="() => textEditable"
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
  </div>
</template>

<script>
import { BoxIcon, XCircleIcon } from "vue-feather-icons";
import TextInput from "./atoms/TextInput";

export default {
  name: "Item",
  components: {
    BoxIcon,
    XCircleIcon,
    TextInput,
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
@import "../styles/colors.scss";

.item {
  background-color: darken($purpleColor2, 12%);
  color: $white;
  padding: 0.3rem;
  width: 100%;
  height: 40px;
  display: flex !important;
  border-radius: 2px;
  cursor: pointer;
  align-items: center;

  img,
  svg {
    min-width: 34px;
    max-width: 34px;
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
  color: $white;

  &:hover {
    color: #ff3c3f;
  }
}
</style>
