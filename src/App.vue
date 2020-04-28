<template>
  <section v-if="loaded" id="app">
    <header-bar :lists.sync="lists" :locked.sync="locked" @change="save()" />
    <section class="box-container">
      <dashboard
        :lists.sync="lists"
        :layout.sync="layout"
        :locked="locked"
        @change="save"
      />
      <aside>
        <side-bar
          :tabs="tabs"
          :locked="locked"
          :stash.sync="stash"
          @change="save"
        />
      </aside>
    </section>
  </section>
</template>

<script>
import { debounce, uuidv4 } from "./utils/utils";
import { storageGet, storageSet } from "./services/chrome/storage";
import Dashboard from "./components/Dashboard";
import SideBar from "./components/SideBar";
import HeaderBar from "./components/Header";
import { fixBrokenLayout } from "./utils/dnd-grid";
import { getTabs } from "./services/app/tabs";

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
      locked: false,
      stash: [],
      tabs: [],
      lists: [],
      layout: [],
    };
  },
  watch: {
    locked() {
      this.saveLocked();
    },
  },
  async created() {
    this.tabs = await getTabs();
    this.stash = [];

    const value = await storageGet(["layout", "lists", "locked", "stash"]);
    this.lists =
      value.lists && value.lists.length > 0
        ? value.lists
        : [{ id: uuidv4(), title: "Edit this list", items: [] }];
    this.layout = fixBrokenLayout(value.layout || [], this.lists);
    this.locked = value.locked || false;
    this.stash = value.stash || [];
    this.loaded = true;
  },
  methods: {
    save: debounce(function () {
      const data = {
        layout: this.layout,
        lists: this.lists,
        stash: this.stash,
      };
      storageSet(data);
    }, 0),
    reset() {
      this.layout = [];
      this.lists = [];
      this.save();
    },
    async saveLocked() {
      await storageSet({
        locked: this.locked,
      });
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

<style lang="scss">
@import "./styles/colors.scss";

.cards-drop-preview {
  background-color: lighten($purpleColor4, 10%);
  border: 1px dashed $white;
  margin-top: 5px;
}
</style>

<style lang="scss" scoped>
@import "./styles/colors.scss";

aside {
  width: calc(100vw - 1705px);
  max-width: 400px;
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
  padding: 0;
  position: relative;
  height: calc(100vh - 35px);
}
</style>
