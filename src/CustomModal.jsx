
// Can't use daisyUI modal since it adds a scrollbar gutter:
// https://github.com/saadeghi/daisyui/issues/3040

import { forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "react-daisyui";

let CustomModal = forwardRef(function CustomModal(props, ref){
    const {title, titleColor, outlineColor, btn, onBtnClick, children} = props;

    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        showModal(){
            setOpen(true);
        },
        close(){
            setOpen(false);
        }
    }), []);

    const onClickToClose = (clickedElementID) => {
        if(clickedElementID == "modalBackdropID" || clickedElementID == "closeButtonID"){
            setOpen(false);
        }
    }

    const getTitleColor = () => {
        if(titleColor == undefined){
            return "";
        }else{
            return "text-" + titleColor;
        }
    }

    const getOutlineColor = () => {
        if(titleColor == undefined){
            return "";
        }else{
            return "outline-" + outlineColor;
        }
    }

    const modal = () => {
        if(open){
            return(
                <div className={"w-96 bg-base-100 z-[202] rounded-lg flex flex-col outline outline-1 " + getOutlineColor()}>
                    {/* Header/Title */}
                    <div className="w-full h-12 flex items-center">
                        <p className={"ml-2 font-bold text-lg select-none " + getTitleColor()}>{title}</p>
                    </div>

                    {/* Children */}
                    <div className="w-full h-full p-2 mb-2">
                        {children}
                    </div>

                    {/* Footer/Buttons */}
                    <div className={"w-full h-16 flex items-center justify-end outline outline-1 rounded rounded-b-lg " + getOutlineColor()}>
                        {(btn != "" && btn != undefined) ? <Button color="primary" className="mx-2" onClick={(event) => {if(onBtnClick != undefined) onBtnClick()}}>{btn}</Button> : <></>}
                        <Button className="mr-2" onClick={() => onClickToClose("closeButtonID")}>Close</Button>
                    </div>
                </div>
            );
        }
    }

    return(
        <div ref={ref} className={"absolute " + ( open ? "left-0 right-0 top-0 bottom-0 z-[200] flex items-center justify-center" : "")}>
            <div onClick={(event) => {onClickToClose(event.target.id)}} id="modalBackdropID" className="absolute left-0 right-0 top-0 bottom-0 bg-neutral opacity-80 z-[201]"></div>
            {modal()}
        </div>
    );
});


export default CustomModal;