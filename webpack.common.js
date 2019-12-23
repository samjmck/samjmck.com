const fs = require('fs');

const entry = {};
for(const script of fs.readdirSync(`${__dirname}/static/scripts/pages`)) {
    // slice to remove .ts
    entry[script.slice(0, -3)] = `${__dirname}/static/scripts/pages/${script}`;
}

module.exports = {
    entry,
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
        path: `${__dirname}/public/static`,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
