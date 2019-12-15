const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const cleanExcludePaths = [
    '_headers',
];

const htmlFileNameByScript = {
    'index.ts': 'index.html',
};

const entry = {};
Object.keys(htmlFileNameByScript).forEach(scriptName => {
    entry[scriptName] = `${__dirname}/src/scripts/pages/${scriptName}`;
});

const htmlWebpackPlugins = Object.keys(entry).map(entryName => new HtmlWebpackPlugin({
    chunks: [entryName],
    template: `${__dirname}/src/${htmlFileNameByScript[entryName]}`,
    filename: `${__dirname}/dist/${htmlFileNameByScript[entryName]}`,
}));

module.exports = {
    entry,
    plugins: [
        new CleanWebpackPlugin(`${__dirname}/dist`, { exclude: cleanExcludePaths }),
        ...htmlWebpackPlugins,
    ],
    output: {
        filename: '[name].[hash].bundle.js',
        chunkFilename: '[name].[chunkhash].chunk.js',
        path: `${__dirname}/dist`,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
