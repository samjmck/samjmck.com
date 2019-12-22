const common = require('./webpack.common');
const { plugins } = common;

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
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                use: ['babel-loader'],
            },
            {
                test: /\.(ts|tsx)$/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
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
        ...plugins,
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css',
        })
    ],
};
