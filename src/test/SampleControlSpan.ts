import Control from "sap/ui/core/Control";
// import Toolbar from "sap/m/Toolbar";
import "reflect-metadata";

/**
 * Renders a simple DIV
 * 
 * @name spinifex.webdemo.controls.SampleControlSpan
 * @cui5control 
 */
export class SampleControlSpan extends Control {

    /** @property */
    private text : string;

    /** @property */
    private style : string;

    // private static metadata = {
    //     properties: {

    //         /** value to put on the style attribute */
    //         style: { type: "string" }
    //     },
    //     aggregations: {
    //         /** Controls to show under this Div */
    //         content: { type: "sap.ui.core.Control", multiple: true, singularName: "content", bindable: true },
    //     },
    //     events: {
    //     }
    // };


    /** Renderer for this control */
    private static renderer = {
        render: (rm:sap.ui.core.RenderManager, oControl:Span) => {
            // const childContents : Control[] = oControl.getAggregation("content");

            rm.write("<span");
            rm.writeControlData(oControl);

            rm.addClass("lbSpan");
            rm.writeClasses();

            // @ts-ignore
            rm.writeAttribute("style", oControl.getStyle());

            rm.write(">");

            // @ts-ignore
            rm.write(oControl.getText());

            
            rm.write("</span>");

        }
    }
}

// type FCProps<T> = T extends { new (...args: infer U) : any } ? U : never;


// interface UploadFilePopup_mSettings extends sap.ui.core.Control_mSettings {}


// type FCProps<T> = T extends new (...args: infer U) => any ? U : never;

// type spanArgs = FCProps<typeof Span>;
// type spanParentArgs = FCProps<typeof Control>;



// export function create(...args: spanArgs & spanParentArgs ) : Span;

