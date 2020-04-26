<template>
  <header>
    <div class="main-area"></div>
    <button class="add-btn" @click="addList">
      <plus-circle-icon />
      <span>Add new List</span>
    </button>
    <h1>| Book-keeper</h1>
  </header>
</template>

<script>
import { uuidv4 } from "../utils/utils";
import { PlusCircleIcon } from "vue-feather-icons";

export default {
  name: "HeaderBar",
  components: { PlusCircleIcon },
  props: {
    lists: {
      type: Array,
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
