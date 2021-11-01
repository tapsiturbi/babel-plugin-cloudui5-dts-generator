import { transformFileSync, transformSync } from '@babel/core';
import myPlugin from '../index.js';
import * as path from "path";
import fs from "fs";

const OUTPATH = "./dist/cloudui5.generated.d.ts";

const pluginsClean = [
    [myPlugin, {
        // rootPath: "./src"
        outputPath: OUTPATH,
        clean: true
    }],
    "@babel/plugin-transform-typescript",
];
const plugins = [
    [myPlugin, {
        // rootPath: "./src"
        outputPath: OUTPATH,
    }],
    "@babel/plugin-transform-typescript",
];

const presets = [
    // "transform-ui5",
    // "@babel/preset-typescript"
];

let output = null;
// output = transformFileSync(path.join(path.resolve(), "./src/test/SampleModel.ts"), {
//     plugins: plugins,
//     presets: presets
// });
// output = transformSync(output.code, {
//     filename: "./src/test/SampleModel.ts",
//     presets: ["transform-ui5"]
// });

// console.log("Model ----------------------- \n", output.code, "\n-------------------------"); // 'const x = 1;'



output = transformFileSync(path.join(path.resolve(), "./src/test/SampleControl.ts"), {
    plugins: pluginsClean,
    presets: presets,
});
// output = transformSync(output.code, {
//     filename: "./src/test/SampleControl.ts",
//     presets: ["transform-ui5"]
// });
// console.log("\n\nControl ----------------------- \n", output.code, "\n-------------------------"); // 'const x = 1;'

transformFileSync(path.join(path.resolve(), "./src/test/SampleControlSpan.ts"), {
    plugins: plugins,
    presets: presets,
});

// console.log("\n\nOutput: ---------------------\n ", fs.readFileSync(OUTPATH).toString(), "\n----------------------\n");