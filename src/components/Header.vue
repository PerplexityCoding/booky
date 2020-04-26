<template>
  <header>
    <div class="main-area">
      <button class="add-btn" @click="addList">
        <plus-circle-icon />
        <span>Add new List</span>
      </button>
    </div>

    <button class="lock-btn" @click="toogleLock">
      <lock-icon v-if="locked" />
      <unlock-icon v-else />
    </button>

    <h1>Book-keeper</h1>
  </header>
</template>

<script>
import { uuidv4 } from "../utils/utils";
import { PlusCircleIcon, LockIcon, UnlockIcon } from "vue-feather-icons";

export default {
  name: "HeaderBar",
  components: { PlusCircleIcon, LockIcon, UnlockIcon },
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
      const lists = [
        ...this.lists,
        {
          id: uuidv4(),
          title: "New list",
          items: [],
        },
      ];
      this.$emit("update:lists", lists);
      this.$emit("change");
    },
    toogleLock() {
      this.locked = !this.locked;
      this.$emit("update:locked", this.locked);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/colors.scss";

header {
  background-color: $purpleColor2;
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
}

.lock-btn,
.add-btn {
  color: $white;
  padding: 0 5px;
  display: flex;
  align-items: center;

  span {
    margin-left: 4px;
  }

  &:hover {
    color: $purpleColor5;
  }
}

.main-area {
  flex: 1;
}
</style>
