import JSONModel from "sap/ui/model/json/JSONModel";
import Control from "sap/ui/core/Control";


/**
 * Model class for Products
 *
 * @name cloudui5.models.ProductModel
 * @cui5model
 */
class ProductModel extends JSONModel {

    /** 
     * item name
     * @property
     */
    private itemName: string;

    /** unique identifier @property */
    private key: string;

    /** @property */
    private stock: number;

}

/**
 * Base class to use as JSONModel.
 *
 * @name spinifex.strato.models.SubViewControlModel
 * @flexmodel
 */
export default class SubViewControlModel extends JSONModel {

    /** 
     * first name 
     * @property
     */
    private firstName: string;

    /** last name */
    private lastName: string;

    /** Email Address */
    private email: string;


    public myMethod() {
        return "value";
    }
}

// function Property() {
//     return function(target: Object, propertyKey: string) {
//         console.log("first(): called");
//     };
//     // throw new Error("Function not implemented.");
// }

