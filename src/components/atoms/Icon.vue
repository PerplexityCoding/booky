<template>
  <div>
    <img v-if="iconLoaded && icon" :src="icon" :style="style" />
    <box-icon v-else :size="size" />
  </div>
</template>

<script>
import { loadIcon } from "../../services/app/icons";
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
  data() {
    return {
      icon: null,
      iconLoaded: false,
    };
  },
  computed: {
    style() {
      return {
        width: this.size + "px",
        height: this.size + "px",
      };
    },
  },
  async mounted() {
    if (this.src) {
      this.icon = await loadIcon(this.src);
    }
    this.iconLoaded = true;
  },
};
</script>

<style lang="scss" scoped></style>
