module.exports = {
  type: "react-app",
  webpack: {
    publicPath: "",
    config(config) {
      config.entry = ["./src/index.js", "pdfjs-dist/build/pdf.worker.entry"];
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
