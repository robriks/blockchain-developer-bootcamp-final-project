"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = (0, tslib_1.__importDefault)(require("commander"));
const web3_1 = (0, tslib_1.__importDefault)(require("web3"));
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const axios_1 = (0, tslib_1.__importDefault)(require("axios"));
const runTestFiles_1 = require("./runTestFiles");
const fileSystem_1 = (0, tslib_1.__importDefault)(require("./fileSystem"));
const remix_simulator_1 = require("@remix-project/remix-simulator");
const logger_1 = (0, tslib_1.__importDefault)(require("./logger"));
const colors_1 = (0, tslib_1.__importDefault)(require("colors"));
const logger = new logger_1.default();
const log = logger.logger;
// parse verbosity
function mapVerbosity(v) {
    const levels = {
        0: 'error',
        1: 'warn',
        2: 'info',
        3: 'verbose',
        4: 'debug',
        5: 'silly'
    };
    return levels[v];
}
function mapOptimize(v) {
    const optimize = {
        true: true,
        false: false
    };
    return optimize[v];
}
const version = require('../package.json').version;
commander_1.default.version(version);
commander_1.default.command('version').description('output the version number').action(function () {
    console.log(version);
});
commander_1.default.command('help').description('output usage information').action(function () {
    commander_1.default.help();
});
// get current version
commander_1.default
    .option('-c, --compiler <string>', 'set compiler version (e.g: 0.6.1, 0.7.1 etc)')
    .option('-e, --evm <string>', 'set EVM version (e.g: petersburg, istanbul etc)')
    .option('-o, --optimize <bool>', 'enable/disable optimization', mapOptimize)
    .option('-r, --runs <number>', 'set runs (e.g: 150, 250 etc)')
    .option('-v, --verbose <level>', 'set verbosity level (0 to 5)', mapVerbosity)
    .action((testsPath) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    // Check if path exists
    if (!fileSystem_1.default.existsSync(testsPath)) {
        log.error(testsPath + ' not found');
        process.exit(1);
    }
    // Check if path is for a directory
    const isDirectory = fileSystem_1.default.lstatSync(testsPath).isDirectory();
    // If path is for a file, file name must have `_test.sol` suffix
    if (!isDirectory && !testsPath.endsWith('_test.sol')) {
        log.error('Test filename should end with "_test.sol"');
        process.exit();
    }
    // Console message
    console.log(colors_1.default.white('\n\t👁\t:: Running remix-tests - Unit testing for solidity ::\t👁\n'));
    // Set logger verbosity
    if (commander_1.default.verbose) {
        logger.setVerbosity(commander_1.default.verbose);
        log.info('verbosity level set to ' + commander_1.default.verbose.blue);
    }
    const compilerConfig = {};
    if (commander_1.default.compiler) {
        const compVersion = commander_1.default.compiler;
        const baseURL = 'https://binaries.soliditylang.org/wasm/';
        const response = yield axios_1.default.get(baseURL + 'list.json');
        const { releases, latestRelease } = response.data;
        const compString = releases ? releases[compVersion] : null;
        if (!compString) {
            log.error(`No compiler found in releases with version ${compVersion}`);
            process.exit();
        }
        else {
            compilerConfig.currentCompilerUrl = compString.replace('soljson-', '').replace('.js', '');
            log.info(`Compiler version set to ${compVersion}. Latest version is ${latestRelease}`);
        }
    }
    if (commander_1.default.evm) {
        compilerConfig.evmVersion = commander_1.default.evm;
        log.info(`EVM set to ${compilerConfig.evmVersion}`);
    }
    if (commander_1.default.optimize) {
        compilerConfig.optimize = commander_1.default.optimize;
        log.info(`Optimization is ${compilerConfig.optimize ? 'enabled' : 'disabled'}`);
    }
    if (commander_1.default.runs) {
        if (!commander_1.default.optimize) {
            log.error('Optimization should be enabled for runs');
            process.exit();
        }
        compilerConfig.runs = commander_1.default.runs;
        log.info(`Runs set to ${compilerConfig.runs}`);
    }
    const web3 = new web3_1.default();
    const provider = new remix_simulator_1.Provider();
    yield provider.init();
    web3.setProvider(provider);
    (0, runTestFiles_1.runTestFiles)(path_1.default.resolve(testsPath), isDirectory, web3, compilerConfig);
}));
if (!process.argv.slice(2).length) {
    log.error('Please specify a file or directory path');
    process.exit();
}
commander_1.default.parse(process.argv);
//# sourceMappingURL=run.js.map