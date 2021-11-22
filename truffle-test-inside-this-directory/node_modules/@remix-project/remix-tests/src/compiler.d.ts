import { SrcIfc, CompilerConfiguration } from './types';
/**
 * @dev Compile file or files before running tests (used for CLI execution)
 * @param filename Name of file
 * @param isDirectory True, if path is a directory
 * @param opts Options
 * @param cb Callback
 *
 * TODO: replace this with remix's own compiler code
 */
export declare function compileFileOrFiles(filename: string, isDirectory: boolean, opts: any, compilerConfig: CompilerConfiguration, cb: any): void;
/**
 * @dev Compile contract source before running tests (used for IDE tests execution)
 * @param sources sources
 * @param compilerConfig current compiler configuration
 * @param importFileCb Import file callback
 * @param opts Options
 * @param cb Callback
 */
export declare function compileContractSources(sources: SrcIfc, compilerConfig: CompilerConfiguration, importFileCb: any, opts: any, cb: any): void;
