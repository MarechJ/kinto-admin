var path = require("path");
var webpack = require("webpack");
var version = require("./package.json").version;
var password_api = require("./plugin_config.json").password_api

console.log(password_api)

module.exports = {
    devtool: "#inline-source-map",
  entry: [
    "babel-polyfill",
    "webpack-hot-middleware/client",
    "./index"
  ],
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "/"
  },
  plugins: [
    new webpack.IgnorePlugin(/^(buffertools)$/), // unwanted "deeper" dependency
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
          KINTO_ADMIN_VERSION: JSON.stringify(version),
          PASSWORD_API: JSON.stringify(password_api)
      }
    }),
  ],
  resolve: {
    extensions: ["", ".js", ".jsx", ".css", ".eot", "png", ".woff", ".woff2", ".ttf", ".svg"]
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: "json",
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        loaders: ["babel"],
        exclude: /node_modules/,
        include: [
          path.join(__dirname),
          path.join(__dirname, "src"),
        ],
      },
      {
        test: /\.css$/,
        loader: "style!css",
      },
      { test: /\.png$/, loader: "url?limit=10000" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.(woff|woff2)$/, loader:"url?prefix=font/&limit=5000" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" }
    ]
  }
};
