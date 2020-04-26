<template>
  <section v-if="loaded" id="app">
    <header-bar :lists.sync="lists" @change="save()" />
    <section class="box-container">
      <dashboard :lists.sync="lists" :layout.sync="layout" @change="save()" />
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
import HeaderBar from "./components/Header";

export default {
  name: "App",
  components: {
    HeaderBar,
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
    async save() {
      await this.$nextTick();
      const data = {
        layout: this.layout,
        lists: this.lists,
      };
      await storageSet(data);
    },
  },
};
</script>

<style lang="scss">
@import "./styles/colors.scss";

* {
  box-sizing: border-box;
}

body {
  background-color: $white;
  color: black;
  margin: 0;
  overflow: hidden;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: $purpleColor4;
    color: $white;
  }
}

button {
  cursor: pointer;
  border: none;
  background: none;
  display: inline;
  padding: 0;
  margin: 0;
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
@import "./styles/colors.scss";

aside {
  width: calc(100vw - 1705px);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.box-container {
  flex: 1;
  display: flex;
  padding: 5px;
}
</style>
