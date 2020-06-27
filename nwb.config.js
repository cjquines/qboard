module.exports = {
  type: "react-app",
  webpack: {
    config(config) {
      config.entry = "./src/index.js";
      config.resolve.extensions = [".ts", ".tsx", ".js", ".jsx"];
      config.module.rules.push({
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [{ loader: "awesome-typescript-loader" }],
      });
      return config;
    },
  },
};
