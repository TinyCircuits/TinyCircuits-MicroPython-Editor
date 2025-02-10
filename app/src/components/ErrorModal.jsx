import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import CustomModal from './CustomModal';


let ErrorModal = forwardRef(function ErrorModal(props, ref){
    const customModalRef = useRef(null);
    const [errorMsg, setErrorMsg] = useState("");

    useImperativeHandle(ref, () => ({
            show(errorMsg){
                setErrorMsg(errorMsg);
                customModalRef.current.showModal();
            },
            close(){
                customModalRef.current.close();
            },
        }), []);


    return(
        <CustomModal title="ERROR:" titleColor="error" outlineColor="error" ref={customModalRef}>
            <div className="text-error">
                {errorMsg}
            </div>
        </CustomModal>
    );
});


export default ErrorModal;