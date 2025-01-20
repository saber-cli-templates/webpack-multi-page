const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path')
const __DEV__ = process.env.NODE_ENV === 'development';
const __STAGING__ = process.env.TARGET_ENV === 'staging';
console.log('process.env.NODE_ENV', process.env.NODE_ENV);

module.exports = {
  mode: __DEV__ ? 'development' : 'production',
  entry: {
    index: './src/pages/index.js',
    test: './src/pages/test.js',

  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: __DEV__ ? '[name].js' : '[name].[chunkhash].js',
    clean: true,
    publicPath: ''
  },
  devtool: __DEV__ ? 'eval-source-map' : false,
  devServer: {
    static: './dist',
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      // 会导致webpack-dev-server相关的代码也被处理，导致开发环境报错
      __DEV__  ? null :
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
          mangle: {
            properties: {
              builtins: false,
              keep_quoted: true,
            }
          }
        }
      })
    ].filter(Boolean),
    minimize: true,
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: "babel-loader", // 架桥梁
        options: {
          presets: [
            [
              "@babel/preset-env",// 将ES6语法转成ES5
              {
                // 低版本浏览器中只补充项目中使用到的ES6语法
                useBuiltIns: "usage" 
              }
            ]
          ]
        }
      },
    ],
  },
  plugins: [
   
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets/images', to: 'assets/images' }
      ]
    }),
    new HtmlWebpackPlugin({ 
      template: './public/index.html',
      filename: 'index.html',
      chunks: ['index'],
    }),

    new HtmlWebpackPlugin({ 
      template: './public/test.html',
      filename: 'test.html',
      chunks: ['test'],
    }),
   
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash].css",
      chunkFilename: "[id].css",
    }),
    new webpack.DefinePlugin({
      __DEV__: __DEV__,
      __STAGING__: __STAGING__,
      // __PROD__: __PROD__,
      // __TEST__: __TEST__,
    })
  ],
}