<template>
  <section v-if="loaded" id="app">
    <header-bar
      :lists.sync="lists"
      :locked.sync="locked"
      @change="save"
      @change:list="saveList"
    />
    <section class="box-container">
      <dashboard
        :lists.sync="lists"
        :layout.sync="layout"
        :locked="locked"
        @change="save"
        @change:list="saveList"
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
import {
  storageGet,
  storageRemove,
  storageSet,
} from "./services/chrome/storage";
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
    this.loadTabs();
    this.loadStorage();

    chrome.storage.sync.get(null, (items) => {
      var allKeys = Object.keys(items);
      console.log(allKeys);
    });
  },
  methods: {
    async loadStorage() {
      const value = await storageGet([
        "layout",
        "listsId",
        "lists",
        "locked",
        "stash",
      ]);
      await this.loadLists(value.listsId);

      this.layout = fixBrokenLayout(value.layout || [], this.lists);
      this.locked = value.locked || false;
      this.stash = value.stash || [];
      this.loaded = true;

      chrome.storage.onChanged.addListener(async (changedData) => {
        for (const dataKey in changedData) {
          const newData = changedData[dataKey].newValue;
          const oldData = changedData[dataKey].oldValue;
          if (newData && newData.type === "list") {
            const oldList = this.lists.filter((list) => list.id !== newData.id);
            this.lists = [...oldList, newData];
          } else if (oldData && oldData.type === "list") {
            this.lists = this.lists.filter((list) => list.id !== oldData.id);
          } else {
            this[dataKey] = newData;
          }
        }
        await this.$nextTick();
      });
    },
    async loadTabs() {
      this.tabs = await getTabs();
      const chromeEvents = [
        "onUpdated",
        "onRemoved",
        "onMoved",
        "onDetached",
        "onAttached",
      ];
      for (const chromeEvent of chromeEvents) {
        chrome.tabs[chromeEvent].addListener(async () => {
          this.tabs = await getTabs();
        });
      }
    },
    async loadLists(listsId) {
      if (!listsId || listsId.length <= 0) {
        this.lists = [{ id: uuidv4(), title: "Edit this list", items: [] }];
      } else {
        const listsById = await storageGet(listsId);
        this.lists = Object.keys(listsById).reduce((acc, listId) => {
          acc.push(listsById[listId]);
          return acc;
        }, []);
      }
    },
    save: debounce(function () {
      const listsId = this.lists.map((list) => list.id);
      const data = {
        layout: this.layout,
        listsId,
        stash: this.stash,
      };

      storageSet(data);
    }, 0),
    saveList({ list, toDelete }) {
      if (toDelete) {
        storageRemove(list.id);
      } else {
        storageSet({
          [list.id]: list,
        });
      }
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
  background-color: $purpleColor4;
  color: $white;
  margin: 0;
  overflow: hidden;
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
