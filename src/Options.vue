<template>
  <div class="options">
    Select interface theme:
    <select v-model="theme" @change="saveTheme">
      <option value="dark-purple">
        Dark purple
      </option>
      <option value="white-purple">
        White purple
      </option>
    </select>
  </div>
</template>

<script>
import { storageGetValue, storageSet } from "./services/chrome/storage";

export default {
  name: "OptionsPage",
  data() {
    return {
      theme: "",
    };
  },
  async created() {
    const theme = await storageGetValue("settings/theme");
    this.theme = theme;
  },
  methods: {
    saveTheme(e) {
      storageSet({ "settings/theme": this.theme });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./styles/mixins.scss";

.options {
  color: var(--font-color);
  min-height: 250px;
}
</style>
