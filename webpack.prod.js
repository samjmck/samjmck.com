const common = require('./webpack.common');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
    ...common,
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
            },
            {
                test: /\.(ts|tsx)$/,
                use: ['awesome-typescript-loader'],
            },
            {
                test: /\.(png|svg|jpg|gif|webp)$/,
                use: ['file-loader'],
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
};
