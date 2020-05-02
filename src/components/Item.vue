<template>
  <div class="item">
    <img v-if="item.icon" :src="icon" />
    <box-icon v-else size="32" />

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
    icons: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  computed: {
    icon() {
      const cachedIcon = this.icons[this.item.icon];
      return cachedIcon ? cachedIcon.data : this.item.icon;
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
  background-color: darken($primaryColor2, 12%);
  color: $fontColor;
  padding: 0.3rem;
  width: 100%;
  height: 40px;
  display: flex !important;
  border-radius: 2px;
  cursor: pointer;
  align-items: center;

  &:hover {
    background-color: darken($primaryColor2, 5%);
  }

  img,
  svg {
    min-width: 32px;
    max-width: 32px;
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
  color: $fontColor;

  &:hover {
    color: #ff3c3f;
  }
}
</style>
