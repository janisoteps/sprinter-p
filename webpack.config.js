const webpack = require('webpack');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['react']
                        }
                    }
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: 'file-loader'
            }
        ]
    },
    entry:  __dirname + '/client/index.js',
    output: {
        path: __dirname + '/client/dist',
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    plugins: [
        new MiniCssExtractPlugin('main.css')
    ],
    watch: true
};
module.exports = config;















//
//
//
//
//
//
//
//
//
//
//
// var webpack = require('webpack');
// var path = require('path');
//
// var BUILD_DIR = path.resolve(__dirname, './client/dist');
// var APP_DIR = path.resolve(__dirname, './client');
//
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//
//
// const config = {
//     entry: {
//         main: APP_DIR + '/index.js'
//     },
//     output: {
//         filename: 'bundle.js',
//         path: BUILD_DIR,
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.css$/,
//                 use: [
//                     MiniCssExtractPlugin.loader,
//                     "css-loader"
//                 ]
//             },
//             {
//                 test: /\.(jsx|js)?$/,
//                 use: [{
//                     loader: "babel-loader",
//                     options: {
//                         cacheDirectory: true,
//                         presets: ['react', 'es2015'] // Transpiles JSX and ES6
//                     }
//                 }]
//             },
//             {
//                 test: /\.(png|svg|jpg|gif)$/,
//                 use: 'file-loader'
//             }
//         ],
//
//     },
//     resolve: {
//         extensions: ['.js', '.jsx', '.css']
//     },
//     plugins: [
//         new MiniCssExtractPlugin('main.css')
//     ],
//     watch: true
// };
//
// module.exports = config;
