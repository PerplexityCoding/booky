<template>
  <span
    ref="input"
    :class="['input', 'multiline', { editable: editable }]"
    :contenteditable="editable"
    role="textbox"
    :aria-multiline="multiline"
    @blur="onBlur"
    @focus="onFocus"
    @keydown="onKeyDown"
    @keypress="onKeyPress"
    @mouseup="onClick"
    @paste.prevent="onPaste"
    >{{ value ? value : "" }}</span
  >
</template>

<script>
import {
  clearSelection,
  placeCaretAtEnd,
  stripHtmlToText,
  placeCaretAtStart,
} from "../../utils/input-utils";

export default {
  name: "TextInput",
  props: {
    value: {
      type: String,
      required: true,
    },
    multiline: {
      type: Boolean,
      default: false,
    },
    initialFocus: {
      type: Boolean,
      default: false,
    },
    shouldBeEditable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      editable: false,
    };
  },

  mounted() {
    if (this.initialFocus) {
      this.forceFocus();
    }
  },

  methods: {
    input() {
      return this.$refs.input;
    },

    onBlur() {
      if (!this.shouldBeEditable) {
        return;
      }
      const input = this.input();
      if (this.editable && input.innerText !== this.value) {
        const value = input.innerText;
        input.scrollLeft = 0;
        this.$emit("update:value", value);
      }
      this.$emit("blur");
      this.editable = false;
    },

    onKeyDown(e) {
      if (e.key === "Escape") {
        const input = this.input();
        e.preventDefault();
        input.innerText = this.value;
        this.editable = false;
        input.blur();
      }
    },

    onKeyPress(e) {
      if (e.key === "Enter") {
        const input = this.input();
        e.preventDefault();
        clearSelection();
        input.blur();
      }
    },

    forceFocus() {
      if (!this.editable) {
        const input = this.input();
        this.editable = true;
        setTimeout(() => {
          input.focus();
          placeCaretAtEnd(input, true);
        }, 0);
      }
    },

    onClick() {
      if (!this.shouldBeEditable) {
        return;
      }

      const input = this.input();
      if (this.editable === false) {
        setTimeout(() => {
          placeCaretAtEnd(input);
        }, 0);
        this.editable = true;
      }
    },

    onFocus() {
      this.$emit("focus");
    },

    onPaste(e) {
      if (!e.clipboardData) {
        return;
      }

      let data =
        e.clipboardData.getData("text/html") ||
        e.clipboardData.getData("text/plain");
      document.execCommand("inserttext", false, stripHtmlToText(data));
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/colors";

.input {
  border: 0;
  background: none;
  padding: 0.2rem;
  text-align: left;
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  border-radius: 0.1rem;
  width: 100%;
  display: inline-block;
  font-size: 13px;

  &.multiline {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: inherit;

    &.editable {
      display: inherit;
      -webkit-line-clamp: none;
      white-space: nowrap;
    }
  }

  &.editable {
    text-overflow: initial;
  }

  &:focus {
    outline: none;
    box-shadow: inset 0px 0px 1px 1px $primaryColor2;
    cursor: text;
  }
}
</style>
