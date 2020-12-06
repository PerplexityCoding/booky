import {
  loadSentry,
  queueVueGlobalErrorHandler,
} from "@/services/sentry/loader";
import Vue from "vue";
import App from "./App.vue";

const isProduction = process.env.NODE_ENV === "production";

Vue.config.productionTip = !isProduction;
Vue.config.performance = !isProduction;

async function main() {
  if (isProduction) {
    loadSentry();
  }

  queueVueGlobalErrorHandler(Vue);

  new Vue({
    render(h) {
      return h(App);
    },
  }).$mount("#app");
}

main();
