"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilationErrors = void 0;
// eslint-disable-next-line no-redeclare
class CompilationErrors extends Error {
    constructor(errors) {
        const mapError = errors.map((e) => { return e.formattedMessage || e.message; });
        super(mapError.join('\n'));
        this.errors = errors;
        this.name = 'CompilationErrors';
    }
}
exports.CompilationErrors = CompilationErrors;
//# sourceMappingURL=types.js.map