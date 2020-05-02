<template>
  <div>
    <img
      v-if="src"
      :src="icon"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
    <box-icon v-else :size="size" />
  </div>
</template>

<script>
import { getIcon } from "../../services/app/icons";
import { BoxIcon } from "vue-feather-icons";

export default {
  name: "Icon",
  components: {
    BoxIcon,
  },
  props: {
    size: {
      type: String,
      default: "32",
    },
    src: {
      type: String,
      required: true,
    },
  },
  computed: {
    icon() {
      return getIcon(this.src);
    },
  },
};
</script>

<style lang="scss" scoped></style>
