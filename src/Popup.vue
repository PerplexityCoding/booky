<template>
  <section>
    <button v-if="isAddToStash" class="addButton" @click="addToStash">
      Add to Stash
    </button>
    <button v-else class="removeButton" @click="removeFromStash">
      Remove from Stash
    </button>
  </section>
</template>

<script>
import { getTabs } from "./services/app/tabs";
import { storageGet, storageSet } from "./services/chrome/storage";

export default {
  name: "Popup",
  data() {
    return {
      isAddToStash: true,
    };
  },
  async mounted() {
    this.isAddToStash = !(await this.isActiveTabInStash());
    console.log(this.isAddToStash);
  },
  methods: {
    async getActiveTab() {
      const tab = await getTabs({ active: true, currentWindow: true });
      if (tab.length > 0) {
        const activeTab = tab[0];
        return activeTab;
      }
      return null;
    },
    async isActiveTabInStash() {
      const activeTab = await this.getActiveTab();
      if (activeTab) {
        const stash = await this.getStash();
        if (stash) {
          return (
            stash.filter((item) => item.href === activeTab.href).length > 0
          );
        }
      }
      return false;
    },
    async updateStash(fn) {
      const activeTab = await this.getActiveTab();
      if (activeTab) {
        let stash = await this.getStash();
        stash = fn(stash, activeTab);
        this.storeAndClose(stash);
      }
    },
    async addToStash() {
      this.updateStash((stash, activeTab) => {
        activeTab.added = +new Date();
        stash.push(activeTab);
        return stash;
      });
    },
    async removeFromStash() {
      this.updateStash((stash, activeTab) => {
        return stash.filter((s) => s.href !== activeTab.href);
      });
    },
    async storeAndClose(stash) {
      await storageSet({
        stash,
      });

      window.close();
    },
    async getStash() {
      return ((await storageGet("stash")) || {}).stash || [];
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./styles/mixins.scss";

button {
  cursor: pointer;
  border: none;
  display: inline;
  margin: 0;
  border-radius: 5px;
  white-space: nowrap;
  padding: 10px;
}

.addButton {
  background-color: var(--green);
}

.removeButton {
  background-color: var(--red);
}
</style>
