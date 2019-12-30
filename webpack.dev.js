const common = require('./webpack.common');

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

module.exports = {
    ...common,
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        port: 8082,
        hot: true,
        contentBase: './dist',
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                options: JSON.parse(fs.readFileSync(`${__dirname}/.babelrc`)),
                loader: 'babel-loader',
            },
            {
                test: /\.(png|svg|jpg|gif|webp)$/,
                use: ['file-loader'],
            }
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
};
