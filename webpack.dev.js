const common = require('./webpack.common');
const { plugins } = common;

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
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        ...plugins,
        new webpack.HotModuleReplacementPlugin(),
    ],
};
