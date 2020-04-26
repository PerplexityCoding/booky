<template>
  <section v-if="loaded" id="app">
    <header>
      Quick Access
      <button @click="addList">Add new list</button>
    </header>
    <section class="box-container">
      <dashboard :lists.sync="lists" :layout.sync="layout" />
      <aside>
        <side-bar :tabs="tabs" />
      </aside>
    </section>
  </section>
</template>

<script>
import { uuidv4 } from "./utils/utils";
import { getTabs } from "./services/chrome/tabs";
import { storageGet, storageSet } from "./services/chrome/storage";
import Dashboard from "./components/Dashboard";
import SideBar from "./components/SideBar";

export default {
  name: "App",
  components: {
    SideBar,
    Dashboard,
  },
  data() {
    return {
      loaded: false,
      tabs: [],
      lists: [],
      layout: [],
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
      icon: tab.favIconUrl,
    }));

    const value = await storageGet(["layout", "lists"]);
    this.loaded = true;
    this.layout = value.layout || [];
    this.lists = value.lists || [];
  },
  methods: {
    cleanupLayout() {
      if (this.lists.length > 0) {
        const listById = this.lists.reduce((acc, value) => {
          if (value.id) acc[value.id] = value;
          return acc;
        });
        return this.layout.filter((l) => listById[l.id] != null);
      }
      return [];
    },
    async save() {
      //const layout = this.cleanupLayout();
      const data = {
        layout: this.layout,
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
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  background-color: white;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: black;
  }
}

.dnd-grid-box {
  z-index: initial;
}

/* Let's get this party started */
::-webkit-scrollbar {
  width: 15px;
}

/* Track */
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 10px 10px rgba(0, 0, 0, 0.3);
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 0, 0.8);
  -webkit-box-shadow: inset 0 0 10px 10px rgba(0, 0, 0, 0.5);
}
::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(255, 0, 0, 0.4);
}
</style>

<style lang="scss" scoped>
aside {
  width: calc(100vw - 1705px);
}

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
