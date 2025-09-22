const path = require("path");
const { override } = require("customize-cra");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = override(
  // Configuration of output and disabling code splitting
  (config) => {
    config.output.path = path.resolve(__dirname, "dist");
    config.output.filename = "static/js/skyhigh_studios_assessment.js";
    config.output.publicPath = "./"; // relative paths

    // To disable code splitting
    config.optimization.splitChunks = {
      cacheGroups: {
        default: false,
      },
    };
    config.optimization.runtimeChunk = false;
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },

  // change html file name
  (config) => {
    config.plugins = config.plugins.map((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin) {
        plugin.options.filename = "skyhigh_studios_assessment.html";
        plugin.options.minify = {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        };
      }
      return plugin;
    });
    return config;
  },

  // settings to handle css and scss files
  (config) => {
    const cssRule = config.module.rules.find(
      (rule) => rule.oneOf && rule.oneOf.length
    );

    if (cssRule) {
      cssRule.oneOf.forEach((oneOfRule) => {
        if (oneOfRule.test && oneOfRule.test.toString().includes("css")) {
          oneOfRule.use = [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: true,
              },
            },
          ];
        }
      });
    }

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: "static/css/skyhigh_studios_assessment.css",
      })
    );

    return config;
  },

  // config to handle images,etc
  (config) => {
    const fileLoaderRule = {
      test: /\.(png|jpe?g|gif|svg)$/i,
      loader: "file-loader",
      options: {
        name: "static/media/[name].[hash:8].[ext]",
        publicPath: "./", // images relative path
        outputPath: "static/media/",
      },
    };

    // file loader path
    config.module.rules.push(fileLoaderRule);

    return config;
  }
);
