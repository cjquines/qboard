const ClosurePlugin = require("closure-webpack-plugin");
import { Configuration } from "webpack";

module.exports = {
  type: "react-app",
  webpack: {
    publicPath: "",

    config(config: Configuration): Configuration {
      config.entry = "./src/index.js";

      if (config.resolve === undefined) config.resolve = {};
      config.resolve.extensions = [".ts", ".tsx", ".js", ".jsx"];

      if (config.module === undefined) config.module = { rules: [] };
      config.module.rules.push({
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [{ loader: "awesome-typescript-loader" }],
      });

      if (config.optimization === undefined) config.optimization = {};
      config.optimization.minimizer = [
        new ClosurePlugin(
          { mode: "STANDARD" },
          {
            // compiler flags here
          }
        ),
      ];

      return config;
    },
  },
};
