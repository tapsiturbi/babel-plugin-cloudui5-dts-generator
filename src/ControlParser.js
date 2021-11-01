import Util from "./util.js";
import { types as t } from "@babel/core";

const NL = "\n";
const TAB = "    ";

/**
 * Parses model classes that creates getters/setters for all private 
 * class properties with @property jsdoc. Class should have the
 * @cui5control in the comments
 */
export default class ControlParser {

    properties = [];
    metadata = null;
    className = "";
    settingInterfaceName = "";
    imports = {};
    super = {
        className: null,
        settingInterface: null
    };
    // superClassName = null;
    // superSettingInterface = null;

    initialize(metadata) {
        this.metadata = metadata;
    }

    /**
     * Handler for all variable declarations made on the code. Checks for all 
     * "require" statements so that we'll know what sap/* classes were loaded.
     * 
     * @param {*} path 
     */
    processImport(path) {
        // only process those that came from root (program)
        if ( this.isImportDeclaration(path) ) {
            const importData = this.parseImports(path);

            console.log("VARDEC: ", importData.name, importData.importPath);
            this.imports[importData.name] = importData.importPath;

            // for(const declaration of path.node.declarations) {
            //     const importData = this.parseImports(declaration);
            //     if ( importData.importPath ) {
            //         console.log("VARDEC: ", importData.name, importData.importPath);
            //         this.imports[importData.name] = importData.importPath;
            //     }
            // }
        }
    }

    /**
     * Checks if the class is a flexmodel and creates getters/setters if they are.
     * @param {*} path 
     */
    processClass(path) {
        if ( this.isFlexControlClass(path) ) {

            // let properties = [];

            this.className = path.node.id.name;

            if ( path.node.superClass && path.node.superClass.name ) {
                this.super.className = path.node.superClass.name;
                this.super.settingInterface = `$${this.super.className}Settings`;
            }

            path.get("body.body").forEach(child => {
                if ( this.isFlexProperty(child) ) {
                    let prop = this.prepProperty(child, path);
                    if ( prop ) {
                        this.properties.push(prop);
                    }
                }
            });

            // path.insertAfter(t.expressionStatement(
            //     t.assignmentExpression("=", 
            //         t.memberExpression(
            //             t.identifier(path.node.id.name),
            //             t.identifier("metadata")
            //         ),

            //         t.objectExpression([
            //             t.objectProperty(
            //                 t.identifier("properties"),
            //                 t.objectExpression(this.properties.map(prop => {
            //                     return t.objectProperty(
            //                         t.identifier(prop.name),
            //                         t.objectExpression([
            //                             t.objectProperty(
            //                                 t.identifier("type"),
            //                                 t.stringLiteral(prop.type)
            //                             )
            //                         ]),
            //                     );
            //                 }))
            //             )
            //         ]),
            //     ),
            // ));
        }
    }

    /**
     * Generates the DTS code using the parsed properties of the class
     * @returns 
     */
    generate() {
        this.settingInterfaceName = `$CloudUI5${Util.capitalize(this.metadata.basepath)}Setting`;

        let code = "";

        code += this.generateConstructor();
        code += this.generateMethods();

        return this.encapsulateInModule(code);
    }

    /**
     * Returns json object with the details of the imports to run
     * @returns 
     */
    prepImports() {
        let returnObj = {};
        // let code = "";

        // import super class and settings interface
        if ( this.super.className ) {
            // code += `import ${this.super.className}, {${this.super.settingInterface}} from "${this.imports[this.super.className]}"; ${NL}`;
            returnObj[this.imports[this.super.className]] = `${this.super.className}, {${this.super.settingInterface}}`;
        }
        // code += `import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";${NL}`;
        returnObj["sap/ui/base/ManagedObject"] = "{ PropertyBindingInfo }";

        // import actual class
        // code += `import {${this.className}} from "${this.metadata.modulePath}"; ${NL}`;
        returnObj[this.metadata.modulePath] = `{${this.className}}`;

        return returnObj;
    }

    /**
     * Returns the import code based on the prepared data
     * @param {*} prepData 
     */
    generateImport(prepData) {
        let code = "";
        for(const importPath in prepData) {
            code += `import ${prepData[importPath]} from "${importPath}"; ${NL}`;
        }
        return code;
    }

    /**
     * Returns the code for the constructor.
     * @returns 
     */
    generateConstructor() {
        let code = "";

        code += this.generateSettingInterface() + NL;

        code += `export namespace ${this.className} {${NL}`;
        code += `${TAB}/**${NL}` +
            `${TAB} * Static method that simulates a constructor. Needed because the constructor${NL}` +
            `${TAB} * cannot be declared in a separate definition file (.d.ts)${NL}` +
            `${TAB} * @param args${NL}` +
            `${TAB}*/${NL}`;
        code += `${TAB}export function create(args: ${this.settingInterfaceName}) : ${this.className}; ${NL}`;
        code += `}${NL}`;
        return code;
    }

    /**
     * Returns the code that defines the setting interface
     * @returns 
     */
    generateSettingInterface() {
        let code = "";
        code += `export interface ${this.settingInterfaceName}`;

        if ( this.super.settingInterface ) {
            code += ` extends ${this.super.settingInterface} `;
        }
        code += `{ ${NL}`;

        for(const prop of this.properties) {
            code += `${TAB}${prop.name}?: ${prop.type != "string" ? prop.type + " |": ""} string | PropertyBindingInfo; ${NL}`;
        }

        code += `} ${NL}`;

        return code;
    }

    /**
     * Returns code that defines the getter/setter of all properties
     */
    generateMethods() {
        let code = "";
        code += `export interface ${this.className} {${NL}`;

        for(const prop of this.properties) {
            code += `${TAB}/** Getter for ${prop.name} property */${NL}`;
            code += `${TAB}get${Util.capitalize(prop.name)}() : ${prop.type};${NL}`;

            code += `${TAB}/** Setter for ${prop.name} property */${NL}`;
            code += `${TAB}set${Util.capitalize(prop.name)}(value : ${prop.type}) : ${this.className};${NL}`;
        }
        
        code += `}${NL}`;

        return code;
    }

    /**
     * Returns the code encapsulated in a module
     * @param {*} code 
     * @returns 
     */
    encapsulateInModule(code) {
        code = NL + code;
        code = code.replace(new RegExp(NL, "g"), NL + TAB);
        return `declare module "${this.metadata.modulePath}" {${NL}${code}${NL}}`;
    }


    /**
     * Returns true if there is a @flexmodel in the comments of the class
     * @param {*} path 
     * @returns 
     */
    isFlexControlClass(path) {
        let leadingComments;
        if ( path && path.node && path.node.leadingComments ) {
            leadingComments = path.node.leadingComments;
        } else if (
            (t.isClassExpression(path.node) && t.isReturnStatement(path.parent)) ||
            (t.isClassDeclaration(path.node) && (
                t.isExportDefaultDeclaration(path.parent) || t.isExportDeclaration(path.parent)
            ))
        ) {
            leadingComments = path.parent.leadingComments;
        }
    
        if ( leadingComments ) {
            return leadingComments.find(c => c.value.indexOf("@cui5control") > -1) ? true : false;;
        }
    
        return false;
    }
    
    /**
     * Returns true if there is @property in the class property.
     * 
     * @param {*} path 
     * @returns 
     */
    isFlexProperty(path) {
        if ( path && path.node && path.node.leadingComments ) {
            return path.node.leadingComments.find(c => c.value.indexOf("@property") > -1) ? true : false;
        }
    
        return false;
    }
    
    /**
     * Creates a getter/setter for the class property.
     * 
     * @param {*} path 
     */
    prepProperty(path) {
        if ( path.node.typeAnnotation ) {
            const name = path.node.key.name;
            const type = Util.getNormalizedTypeByPath(path);

            return { name, type };

        }

        return null;
    }

    /**
     * Returns true if the path being traversed is a VariableDeclaration doing an import.
     * @param {*} path 
     * @returns 
     */
    isImportDeclaration(path) {
        return path.parent && path.parent.type === "Program" 
            && path.node.specifiers && path.node.specifiers[0]
            && path.node.specifiers[0].local.name
            && path.node.source && path.node.source.type == "StringLiteral";
    }

    /**
     * Parses the variable name and import path being done on an ast declaration 
     * @param {*} path
     */
    parseImports(path) {
        const name = path.node.specifiers[0].local.name;
        const importPath = path.node.source.value;
        return { name, importPath };
    }
}