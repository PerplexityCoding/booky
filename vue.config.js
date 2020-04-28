module.exports = {
  pages: {
    index: {
      entry: 'src/main.js', //entry for the public page
      template: 'public/index.html', // source template
      filename: 'index.html' // output as dist/*
    },
    popup: {
      entry: 'src/popup.js',
      template: 'public/popup.html',
      filename: 'popup.html'
    },
  },
  configureWebpack: {
    devtool: "cheap-module-source-map",
  },
};
