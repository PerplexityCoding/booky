<template>
  <div class="options">
    <div class="options-entry">
      <label>
        Select interface theme:
      </label>
      <select v-model="theme" @change="saveTheme">
        <option value="purple">
          Purple
        </option>
        <option value="zen">
          Zen
        </option>
        <option value="business-gray">
          Business gray
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { storageGetValue, storageSet } from "./services/chrome/storage";

export default {
  name: "OptionsPage",
  data() {
    return {
      theme: "zen",
    };
  },
  async created() {
    const theme = await storageGetValue("settings/theme");
    this.theme = theme || this.theme;
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
  display: flex;
  width: 100%;

  &-entry {
    display: flex;
    flex: 1;
    height: 26px;

    label {
      flex: 1;
      font-size: 1.1rem;
    }

    input {
      font-size: 1.1rem;
    }
  }
}
</style>
