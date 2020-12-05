const webpack = require("webpack");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");

const isDevelopment = process.env.NODE_ENV === "development";
const isReleasing = !!process.env.VERSION;
const sentryRelease = `booky@${process.env.npm_package_version}`;

const webpackPlugins = [
  new webpack.EnvironmentPlugin({
    SENTRY_RELEASE: sentryRelease,
  }),
];

if (isReleasing) {
  webpackPlugins.push(
    new SentryWebpackPlugin({
      // sentry-cli configuration
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "magl",
      project: "booky",

      // webpack specific configuration
      release: sentryRelease,
      include: "./dist",
      ignore: ["node_modules", "vue.config.js"],
    })
  );
}

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
      title: "Book-Keeper - Options",
      entry: "src/options.js",
      template: "public/options.html",
      filename: "options.html",
    },
  },
  configureWebpack: {
    devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
  },
  chainWebpack: (config) => {
    if (config.plugins.has("prefetch-index")) {
      config.plugin("prefetch-index").tap((options) => {
        options[0].fileBlacklist = [/\.map$/, /sentry/];
        return options;
      });
    }
  },
};
