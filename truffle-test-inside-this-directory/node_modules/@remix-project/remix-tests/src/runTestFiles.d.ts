import { CompilerConfiguration, Options } from './types';
import Web3 from 'web3';
/**
 * @dev run test contract files (used for CLI)
 * @param filepath Path of file
 * @param isDirectory True, if path is a directory
 * @param web3 Web3
 * @param finalCallback optional callback to run finally
 * @param opts Options
 */
export declare function runTestFiles(filepath: string, isDirectory: boolean, web3: Web3, compilerConfig: CompilerConfiguration, finalCallback?: any, opts?: Options): void;
