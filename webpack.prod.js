const common = require('./webpack.common');

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
        ],
    },
    plugins: [],
};
