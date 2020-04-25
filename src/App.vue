<template>
  <div v-if="loaded" id="app">
    <div class="box-container">
      <button @click="addList">Add new list</button>
      <dnd-grid-container
        :layout.sync="layout"
        :cell-size="cellSize"
        :max-column-count="12"
        :outer-margin="5"
        class="grid-container"
      >
        <dnd-grid-box
          v-for="list in lists"
          :key="'dnd-box-' + list.id"
          :box-id="'box-' + list.id"
          :resizable="true"
          drag-selector="header"
          class="box-item"
        >
          <header>
            {{ list.title }}
            <button @click="deleteList(list.id)">Delete list</button>
          </header>
          <smooth-dnd-container
            group-name="tabs"
            @drop="(e) => onCardDrop(list.id, e)"
            :get-child-payload="getCardPayload(list.id)"
          >
            <smooth-dnd-draggable
              v-for="item in list.items"
              :key="item.id"
              class="tab-item"
            >
              <a :href="item.href">{{ item.body }}</a>
            </smooth-dnd-draggable>
          </smooth-dnd-container>
          <button @click="addItem(list)">Add new empty item</button>
        </dnd-grid-box>
      </dnd-grid-container>
    </div>
    <div>
      <smooth-dnd-container behaviour="copy" group-name="tabs" :should-accept-drop="() => false" :get-child-payload="getCardPayloadFromTabsList()">
        <smooth-dnd-draggable
          v-for="tab in tabs"
          :key="`tab-${tab.id}`"
          class="tab-item"
        >
          {{ tab.body }}
        </smooth-dnd-draggable>
      </smooth-dnd-container>
    </div>
  </div>
</template>

<script>
import { Container as DndGridContainer, Box as DndGridBox } from "./dnd-grid";
import {
  Container as SmoothDndContainer,
  Draggable as SmoothDndDraggable,
} from "vue-smooth-dnd";
import data from "./sample.json";
import { uuidv4 } from "./utils";

export const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult;
  if (removedIndex === null && addedIndex === null) return arr;

  const result = [...arr];
  let itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
};

export default {
  name: "App",
  components: {
    DndGridContainer,
    DndGridBox,
    SmoothDndContainer,
    SmoothDndDraggable,
  },
  data() {
    return {
      loaded: false,
      tabs: [],
      lists: data,
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
        this.save();
      }
    }
  },
  async mounted() {
    const chromeTabs = await this.getTabs();
    this.tabs = chromeTabs.map((tab) => ({
      id: uuidv4(),
      tabId: tab.id,
      body: tab.title,
      href: tab.url
    }));

    chrome.storage.sync.get(["layout", "lists"], (value) => {
      this.loaded = true;
      this.layout = value.layout;
      this.lists = value.lists;
    });
  },
  methods: {
    save() {
      const data = {
        layout: this.layout,
        lists: this.lists,
      };
      chrome.storage.sync.set(data, () => {
        console.log("Value is set to " + data);
      });
    },
    getTabs() {
      return new Promise((resolve, reject) => {
        chrome.tabs.query(
          {
            currentWindow: true,
          },
          resolve
        );
      });
    },
    addList() {
      this.lists.push({
        id: uuidv4(),
        title: "New list",
        items: [],
      });
    },
    deleteList(id) {
      this.lists = this.lists.filter((i) => i.id != id);
      this.layout = this.layout.filter((i) => i.id != id);
    },
    addItem(list, item) {
      if (!item) {
        item = {
          id: uuidv4(),
          body: "Empty",
        };
      }

      if (!list.items) {
        list.items = [];
      }

      list.items.push(item);

      this.save();
    },
    getList(listId) {
      return this.lists.filter((list) => list.id === listId)[0];
    },
    onCardDrop(listId, dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        let list = this.getList(listId);
        list.items = applyDrag(list.items, dropResult);
      }
    },
    getCardPayload(listId) {
      return (index) => {
        let list = this.getList(listId);
        return list.items[index];
      };
    },
    getCardPayloadFromTabsList() {
      return (index) => {
        return this.tabs[index];
      };
    }
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
}

.box-container {
  flex: 1;
}

.tab-item {
  background-color: #2c3e50;
  color: white;
  padding: 0.2rem;
}

.box-item {
  height: 100px;
  width: 100px;
  background-color: grey;
}
</style>
