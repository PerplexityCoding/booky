<template>
  <header>
    <div class="main-area">
      <button v-if="!locked" class="add-btn" @click="addList">
        <plus-circle-icon />
        <span>Add new List</span>
      </button>
    </div>

    <button class="lock-btn" @click="toogleLock">
      <lock-icon v-if="locked" />
      <unlock-icon v-else />
    </button>

    <button class="lock-btn" @click="openSettings">
      <settings-icon />
    </button>

    <h1>Book-keeper</h1>
  </header>
</template>

<script>
import { uuidv4 } from "../utils/utils";
import { PlusCircleIcon, LockIcon, UnlockIcon, SettingsIcon } from "vue-feather-icons";

export default {
  name: "HeaderBar",
  components: { PlusCircleIcon, LockIcon, UnlockIcon, SettingsIcon },
  props: {
    lists: {
      type: Array,
      required: true,
    },
    locked: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    addList() {
      const newList = {
        id: uuidv4(),
        type: "list",
        title: "New list",
        items: [],
      };
      const lists = [...this.lists, newList];
      this.$emit("update:lists", lists);
      this.$emit("change:list", { list: newList });
      this.$emit("change");
    },
    toogleLock() {
      this.$emit("update:locked", !this.locked);
    },
    openSettings() {
      chrome.runtime.openOptionsPage();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/mixins.scss";

header {
  @include backgroundColor(--header-color);
  @include fontColor(--font-color-white);
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
}

.lock-btn,
.add-btn {
  @include fontColor(--font-color-white);
  padding: 0 5px;
  display: flex;
  align-items: center;

  span {
    margin-left: 4px;
  }

  &:hover {
    @include fontColor(--green);
  }
}

.main-area {
  flex: 1;
}
</style>
