"use strict";
const tslib_1 = require("tslib");
// Extend fs
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const fs = require('fs');
// https://github.com/mikeal/node-utils/blob/master/file/lib/main.js
fs.walkSync = function (start, callback) {
    fs.readdirSync(start).forEach((name) => {
        if (name === 'node_modules') {
            return; // hack
        }
        const abspath = path_1.default.join(start, name);
        if (fs.statSync(abspath).isDirectory()) {
            fs.walkSync(abspath, callback);
        }
        else {
            callback(abspath);
        }
    });
};
module.exports = fs;
//# sourceMappingURL=fileSystem.js.map