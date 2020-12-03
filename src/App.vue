<template>
  <section v-if="loaded" id="app" class="top-quick-access">
    <header-bar
      class="header-bar"
      :lists.sync="lists"
      :locked.sync="locked"
      @change="save"
      @change:list="saveList"
    />
    <quick-access
      class="quick-access"
      :locked="locked"
      :items.sync="quickAccess"
      @update:items="saveQuickAcess"
    />
    <dashboard
      class="dashboard"
      :lists.sync="lists"
      :layout.sync="layout"
      :locked="locked"
      @change="save"
      @change:list="saveList"
    />
    <aside class="side-bar">
      <side-bar
        :tabs="visibleTabs"
        :locked="locked"
        :stash.sync="stash"
        @change="save"
      />
    </aside>
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
import QuickAccess from "./components/QuickAccess";
import { loadIcons } from "./services/app/icons";

export default {
  name: "App",
  components: {
    QuickAccess,
    HeaderBar,
    SideBar,
    Dashboard,
  },
  data() {
    return {
      loaded: false,
      locked: true,
      stash: [],
      tabs: [],
      lists: [],
      layout: [],
      quickAccess: [],
      theme: "zen",
    };
  },
  computed: {
    visibleTabs() {
      return this.tabs.filter((t) => t.href !== "chrome://newtab/");
    },
  },
  async created() {
    this.loadTabs();
    this.loadStorage();
    this.updateStash();
  },
  methods: {
    async loadStorage() {
      const value = await storageGet([
        "layout",
        "listsId",
        "lists",
        "stash",
        "quickAccess",
        "settings/theme",
      ]);
      await this.loadLists(value.listsId);
      await loadIcons();

      this.layout = fixBrokenLayout(value.layout || [], this.lists);
      this.stash = value.stash || [];
      this.quickAccess = value.quickAccess || [];
      this.theme = value["settings/theme"] || this.theme;
      this.loaded = true;

      this.loadTheme();

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
    loadTheme() {
      document.documentElement.setAttribute("theme", this.theme);
    },
    async loadTabs() {
      this.tabs = await getTabs();
      const chromeEvents = [
        "onCreated",
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
      chrome.tabs.onUpdated.addListener(async (tabId, changedInfo, tab) => {
        const isComplete = changedInfo.status === "complete";
        const hasFavIcon = changedInfo.favIconUrl != null;
        const tabItem = this.tabs.filter((tab) => tab.tabId === tabId)[0];

        if (tab) {
          tabItem.body = tab.title;
        }
        if (hasFavIcon) {
          tabItem.icon = changedInfo.favIconUrl;
        }

        tabItem.href = tab.url;
      });
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
    async saveQuickAcess() {
      await storageSet({
        quickAccess: this.quickAccess,
      });
    },
    async updateStash() {
      // to move outside
      const stashRemoveTime = 30 * 24 * 60 * 60 * 1000; // 30 days
      const stash = ((await storageGet("stash")) || {}).stash;
      const now = +new Date();

      const items = [];
      if (stash) {
        for (const item of stash) {
          if (!item.added) {
            item.added = now;
          } else if (now - item.added > stashRemoveTime) {
            continue;
          }
          items.push(item);
        }
      }

      await storageSet({ stash: items });
    },
  },
};
</script>

<style lang="scss">
@import "./styles/colors.scss";
@import "./styles/mixins.scss";

* {
  box-sizing: border-box;
}

body {
  @include backgroundColor(--primary-color1);
  color: var(--font-color);
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
@import "./styles/mixins.scss";

.cards-drop-preview {
  @include backgroundColor(--primary-color2, -100%);
  border: 1px dashed var(--font-color);
  margin-top: 5px;
}
</style>

<style lang="scss" scoped>
@import "./styles/mixins.scss";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  display: grid;
  flex-direction: column;
  position: fixed;
  grid-template-columns: 40px auto max(min(400px, 12%), 225px);
  grid-template-rows: 40px 106px calc(100% - 107px);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

#app.left-quick-access {
  grid-template-areas:
    "header header header"
    "quick-access main sidebar"
    "quick-access main sidebar";
}

#app.top-quick-access {
  grid-template-areas:
    "header header header"
    "quick-access quick-access sidebar"
    "main main sidebar";
}

.header-bar {
  grid-area: header;
}

.quick-access {
  grid-area: quick-access;
}

.dashboard {
  grid-area: main;
}

.side-bar {
  grid-area: sidebar;
  display: flex;
}
</style>
