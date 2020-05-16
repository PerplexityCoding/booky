import Vue from "vue";
import Options from "./Options.vue";

Vue.config.productionTip = false;

new Vue({
  render(h) {
    return h(Options);
  },
}).$mount("#app");
