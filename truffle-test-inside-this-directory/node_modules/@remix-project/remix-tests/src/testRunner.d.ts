import { TestCbInterface, ResultCbInterface, CompiledContract, AstNode, Options } from './types';
export declare function runTest(testName: string, testObject: any, contractDetails: CompiledContract, fileAST: AstNode, opts: Options, testCallback: TestCbInterface, resultsCallback: ResultCbInterface): void;
