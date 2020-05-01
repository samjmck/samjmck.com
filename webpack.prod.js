const common = require('./webpack.common');

module.exports = {
    ...common,
    mode: 'production',
    // Hugo doesn't move sourcemaps so we don't make them
    // devtool: 'none',
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
