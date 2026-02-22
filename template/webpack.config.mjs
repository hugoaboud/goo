import path from "node:path";
import { fileURLToPath } from "node:url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD = false;

export default {
  entry: "./src/index.ts",
  mode: BUILD ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.goo$/,
        exclude: /node_modules/,
        use: [
          { loader: 'ts-loader', options: { transpileOnly: true } },
          { loader: '@quimblos/goo-loader' },
        ]
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".goo"],
    // fallback: { path: false }
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
  },
  optimization: {
    minimize: BUILD,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: 
  BUILD ? [
    new HtmlWebpackPlugin({
      title: "My Web App",
      template: "index.html",
      // this is a workaround for the injection of the code from the output file into the .html
      // the injection will be handled in the template file
      inject: false,
      // inlineSource: '.(js|css)$' // embed all javascript and css inline
    })
  ] : [
    new HtmlWebpackPlugin({
      title: "My Web App",
    })
  ],
};