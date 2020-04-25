<template>
  <section v-if="loaded" id="app">
    <header>
      Quick Access
    </header>
    <section class="box-container">
      <dashboard :lists.sync="lists" :layout.sync="layout" />
      <button @click="addList">Add new list</button>
      <aside>
        <smooth-dnd-container
          behaviour="copy"
          group-name="tabs"
          :should-accept-drop="() => false"
          :get-child-payload="getCardPayloadFromTabsList()"
        >
          <smooth-dnd-draggable
            v-for="tab in tabs"
            :key="`tab-${tab.id}`"
            class="tab-item"
          >
            {{ tab.body }}
          </smooth-dnd-draggable>
        </smooth-dnd-container>
      </aside>
    </section>
  </section>
</template>

<script>
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "vue-smooth-dnd";
import { uuidv4 } from "./utils/utils";
import { getTabs } from "./services/chrome/tabs";
import { storageGet, storageSet } from "./services/chrome/storage";
import Dashboard from "./components/Dashboard";

export default {
  name: "App",
  components: {
    Dashboard,
    SmoothDndContainer,
    SmoothDndDraggable,
  },
  data() {
    return {
      loaded: false,
      tabs: [],
      lists: [],
      layout: [],
      cellSize: {
        h: 100,
        w: 200,
      },
    };
  },
  watch: {
    layout() {
      this.save();
    },
    lists: {
      deep: true,
      handler() {
        console.log(this.lists);
        this.save();
      },
    },
  },
  async mounted() {
    const chromeTabs = await getTabs();
    this.tabs = chromeTabs.map((tab) => ({
      id: uuidv4(),
      tabId: tab.id,
      body: tab.title,
      href: tab.url,
    }));

    const value = await storageGet(["layout", "lists"]);
    this.loaded = true;
    this.layout = value.layout;
    this.lists = value.lists;
  },
  methods: {
    cleanupLayout() {
      const listById = this.lists.reduce((acc, value) => {
        if (value.id) acc[value.id] = value;
        return acc;
      });
      return this.layout.filter((l) => listById[l.id] != null);
    },
    async save() {
      const layout = this.cleanupLayout();
      const data = {
        layout,
        lists: this.lists,
      };
      await storageSet(data);
    },
    addList() {
      this.lists.push({
        id: uuidv4(),
        title: "New list",
        items: [],
      });
    },
    getCardPayloadFromTabsList() {
      return (index) => {
        return this.tabs[index];
      };
    },
  },
};
</script>

<style>
body {
  background-color: white;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: black;
  }
}

.smooth-dnd-ghost {
  background-color: red !important;
  z-index: 1000;
}

.dnd-grid-box {
  z-index: initial;
}
</style>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}

.box-container {
  flex: 1;
  display: flex;
}

.tab-item {
  background-color: #2c3e50;
  color: white;
  padding: 0.2rem;
}
</style>
