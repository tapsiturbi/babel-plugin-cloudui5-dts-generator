import { declare } from "@babel/helper-plugin-utils";
import ControlParser from "./ControlParser.js";
import { ModelParser } from "./ModelParser.js";
import fs from "fs";
import * as path from "path";
import * as os from "os";
import Util from "./util";

const TEMP_FOLDER = path.join(os.tmpdir(), "CUI5");
const IMPORT_PREFIX = "00_imports_";

/**
 * Declare visitor as expected from a babel plugin
 */
export default declare((api, options) => {
    api.assertVersion(7);

    let modelParser = new ModelParser();
    let controlParser = new ControlParser();
    let outpath = "";

    let metadata = {
        basepath: "",
        modulePath: "",
        relativePath: "",
        fileOutPath: "",
    };
    let tempFilenames = [];

    function getTempPath(prefix = "") {
        return path.join(TEMP_FOLDER, `${prefix}${metadata.relativePath}/${metadata.basepath}`.replace(/\//g, "_"));
    }

    function cleanTempDir() {
        const filenames = fs.readdirSync(TEMP_FOLDER);
        for(const filename of filenames) {
            fs.unlinkSync(path.join(TEMP_FOLDER, filename));
        }
    }

    function saveCodeInTemp() {
        const tempPath = getTempPath();
        const output = controlParser.generate();                    
        Util.ensureDir(tempPath);
        fs.writeFileSync(tempPath, output);
        console.log("Code saved in ", tempPath);
    }

    function saveImportsInTemp() {
        const tempPath = getTempPath(IMPORT_PREFIX);
        const importData = controlParser.prepImports();
        fs.writeFileSync(tempPath, JSON.stringify(importData));
        console.log("Imports saved in ", tempPath);
    }

    /**
     * loads the import files
     */
    function loadImports() {
        let loadedJson = {};
        for(const filename of tempFilenames) {
            if ( filename.startsWith(IMPORT_PREFIX) ) {
                const content = fs.readFileSync(path.join(TEMP_FOLDER, filename), { encoding: "utf-8" });
                const jsonContent = JSON.parse(content);
                
                loadedJson = { ...loadedJson, ...jsonContent };
            }
        }

        fs.appendFileSync(metadata.fileOutPath, "\n\n" + controlParser.generateImport(loadedJson));
    }

    function loadCode() {
        for(const filename of tempFilenames) {
            if ( !filename.startsWith(IMPORT_PREFIX) ) {
                console.log("Reading: ", path.join(TEMP_FOLDER, filename));
                const content = fs.readFileSync(path.join(TEMP_FOLDER, filename), { encoding: "utf-8" });

                fs.appendFileSync(metadata.fileOutPath, "\n\n" + content);
            }
        }
    }
    
    /**
     * Return the format that babel plugin expects
     */
    return {
        name: "babel-plugin-cloudui5-dts-generator",

        /**
         * Called at the beginning of this plugin
         * @param {*} file 
         */
        pre(file) {
            const { opts } = this;
            const {
                filename
            } = file.opts;
            let {
                rootPath = "./src",
                outputPath = path.join("./dist", `cloudui5.generated.d.ts`),
                clean = false
            } = opts;

            const basepath = path.basename(filename).replace(/\.ts|\.js/g, "");
            const dirname = path.dirname(filename);

            // metadata.fileOutPath = path.join(dirname, `${basepath}.generated.d.ts`);
            metadata.basepath = basepath;
            metadata.fileOutPath = outputPath;
            metadata.relativePath = path.relative(rootPath, dirname);
            metadata.modulePath = "./" + metadata.relativePath + "/" + basepath;
            metadata.clean = clean;
            console.log(`PRE: metadata=${JSON.stringify(metadata)}`);

            if ( metadata.clean ) {
                cleanTempDir();
            }

            controlParser.initialize(metadata);
        },

        visitor: {
            ImportDeclaration(path) {
                controlParser.processImport(path);
            },

            ClassDeclaration(path) {
                controlParser.processClass(path);
            },

            Program: {
                exit: function visit(path) {
                    saveCodeInTemp();
                    saveImportsInTemp();
                }
            }
        },

        /**
         * consolidate all previously generated in the output 
         * @param {*} file 
         */
        post(file) {

            let created = false;

            // delete previous content 
            if ( fs.existsSync(metadata.fileOutPath)) {
                fs.unlinkSync(metadata.fileOutPath);
            }

            Util.ensureDir(metadata.fileOutPath);

            tempFilenames = fs.readdirSync(TEMP_FOLDER + "/");
            loadImports();
            loadCode();

            // for(const filename of filenames) {
            //     console.log("Reading: ", path.join(TEMP_FOLDER, filename));
            //     const content = fs.readFileSync(path.join(TEMP_FOLDER, filename), { encoding: "utf-8" });
            //     if ( created ) {
            //         fs.appendFileSync(metadata.fileOutPath, "\n\n" + content);
            //         // console.log("Appended ", filename);
            //     } else {
            //         fs.writeFileSync(metadata.fileOutPath, content);
            //         created = true;
            //         // console.log("Created ", filename);
            //     }
            // }

        //     const output = controlParser.generate(metadata);
        //     fs.writeFileSync(metadata.fileOutPath, output);
        }
    };
});
