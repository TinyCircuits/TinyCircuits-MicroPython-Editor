import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { Button, Modal, Input, Checkbox} from 'react-daisyui'
import CustomModal from './CustomModal';


let InputModal = forwardRef(function InputModal(props, ref){

    const [title, setTitle] = useState("");
    const [placeHolder, setPlaceHolder] = useState("");
    const [value, setValue] = useState("");
    const valueRef = useRef("");
    const customModalRef = useRef(null);
    const complete = useRef(null);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useImperativeHandle(ref, () => ({
        showModal(){
            customModalRef.current.showModal();
        },
        close(){
            customModalRef.current.close();
        },
        ask(title, defaultValue){
            setTitle(title);
            setPlaceHolder(placeHolder);
            setValue(defaultValue);

            return new Promise((resolve, reject) => {
                let checkComplete = () => {
                    if(complete.current == true){
                        customModalRef.current.close();
                        complete.current = null;
                        resolve(valueRef.current);
                    }else if(complete.current == false){
                        customModalRef.current.close();
                        complete.current = null;
                        resolve(undefined);
                    }else{
                        setTimeout(checkComplete, 50); // 20 times a second check
                    }
                }

                customModalRef.current.showModal();
                checkComplete();
            });
        }
    }), []);


    return(
        <CustomModal title={title} ref={customModalRef} onCloseClick={() => {complete.current = false}} btn="Rename" onBtnClick={() => {complete.current = true}}>
            <div className="w-full h-full flex flex-row justify-evenly">
                <div className="flex w-full component-preview items-center mb-4 justify-center gap-2 font-sans">
                    <div className="form-control w-full max-w-xs">
                        <label className="label">
                            <span className="label-text">Input a new name:</span>
                        </label>
                        <Input placeholder={placeHolder} value={value} onChange={(event) => {setValue(event.target.value)}}/>
                    </div>
                </div>
            </div>
        </CustomModal>
    );
});


export default InputModal;