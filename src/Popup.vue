<template>
  <section>
    <button @click="addToStash">Add to Stash</button>
  </section>
</template>

<script>
import { getTabs } from "./services/app/tabs";
import { storageGet, storageSet } from "./services/chrome/storage";

export default {
  name: "Popup",
  methods: {
    async addToStash() {
      const tab = await getTabs({ active: true, currentWindow: true });
      if (tab.length > 0) {
        const activeTab = tab[0];
        console.log(activeTab);

        const stash = ((await storageGet("stash")) || {}).stash || [];
        stash.push(activeTab);
        await storageSet({
          stash,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./styles/colors.scss";

button {
  cursor: pointer;
  border: none;
  background: none;
  display: inline;
  margin: 0;
  background-color: $purpleColor5;
  border-radius: 5px;
  white-space: nowrap;
  padding: 10px;
}
</style>
