const fs = require('fs');

const entry = {};
for(const script of fs.readdirSync(`${__dirname}/assets/scripts/pages`)) {
    // slice to remove .ts
    entry[script.slice(0, -3)] = `${__dirname}/assets/scripts/pages/${script}`;
}

module.exports = {
    entry,
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
        publicPath: '/',
        path: `${__dirname}/assets/generated-bundles`,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
