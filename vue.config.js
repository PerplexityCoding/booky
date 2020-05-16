module.exports = {
  pages: {
    index: {
      title: "Book-Keeper",
      entry: "src/main.js", //entry for the public page
      template: "public/index.html", // source template
      filename: "index.html", // output as dist/*
    },
    popup: {
      title: "Book-Keeper",
      entry: "src/popup.js",
      template: "public/popup.html",
      filename: "popup.html",
    },
    options: {
      title: "Book-Keeper",
      entry: "src/options.js",
      template: "public/options.html",
      filename: "options.html",
    },
    background: {
      title: "Book-Keeper",
      entry: "src/background.js",
    },
  },
  configureWebpack: {
    devtool: "cheap-module-source-map",
  },
};
