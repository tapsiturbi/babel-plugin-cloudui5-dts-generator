import Control from "sap/ui/core/Control";
import Icon from "sap/ui/core/Icon";
import Input from "sap/m/Input";
import Button from "sap/m/Button";
import IconPool from "sap/ui/core/IconPool";
// import Util from "spinifex/strato/platform/utils/Util";
// import ValueState from "sap/ui/core/ValueState";

/**
 * Control that shows a text (aggregation control) with an edit
 * icon besides it. If the edit icon is pressed, shows an
 * input control and a save/cancel icon next to it.
 *
 * @name cloudui5.controls.EditableText
 * @cui5control
 */
export default class EditableText extends Control {

    /** @property */
    private styleAttr: string;

    /** @property */
    private editable: boolean = false;

    /** @property */
    // private valueState: ValueState;

    /** @property */
    private startDate: Date;

    /** @property */
    private values: any[];

    /** @property */
    private counter: number;

    /** @property */
    private largeNumber: bigint;

    /** @property */
    private numbers: number[];



    private isRendered:boolean = false;

    /**
     * Called when initialized. Creates the initial controls
     * @param args
     */
    init(...args:any) {
        if ( Control.prototype.init )
            Control.prototype.init.call(this, ...args);
        console.log("init called")
    }

    /**
     * Override the setter of the property "value"
     * @param sValue
     * @param bOverride
     */
    setValue(sValue:string, bOverride?:boolean) {
        let ctlInput = <Input>this.getAggregation("_editInput");
        // let sNewValue = this.getCleanValueOnLiveChange() ? Util.checkForHtmlTags(sValue) : sValue;
        this.setProperty("value", sValue, bOverride);
        if ( sValue != ctlInput.getValue() ) {
            ctlInput.setValue(sValue);
        }
    }


    /** Renderer for this control */
    private static renderer = {}
}

