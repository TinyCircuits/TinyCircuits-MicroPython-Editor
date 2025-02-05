import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { Button, Modal, Input, Checkbox} from 'react-daisyui'
import CustomModal from './CustomModal';
import FilesPanel from './FilesPanel';


let ConfirmModal = forwardRef(function ConfirmModal(props, ref){

    const [title, setTitle] = useState("");
    const [yesPrompt, setYesPrompt] = useState("");
    const [noPrompt, setNoPrompt] = useState("");
    const customModalRef = useRef(null);
    const decision = useRef(null);

    useImperativeHandle(ref, () => ({
        showModal(){
            customModalRef.current.showModal();
        },
        close(){
            customModalRef.current.close();
        },
        request(title, yes, no){
            setTitle(title);
            setYesPrompt(yes);
            setNoPrompt(no);

            return new Promise((resolve, reject) => {
                let checkDecision = () => {
                    if(decision.current == true){
                        customModalRef.current.close();
                        decision.current = null;
                        resolve(true);
                    }else if(decision.current == false){
                        customModalRef.current.close();
                        decision.current = null;
                        resolve(false);
                    }else{
                        setTimeout(checkDecision, 50); // 20 times a second check
                    }
                }

                customModalRef.current.showModal();
                checkDecision();
            });
        }
    }), []);


    return(
        <CustomModal title={title} ref={customModalRef} onCloseClick={() => {decision.current = false}}>
            <div className="w-full h-full flex flex-row justify-evenly">
                <Button size="lg" variant='outline' onClick={() => {decision.current = true}}>
                    <p>{yesPrompt}</p>
                </Button>
                <Button size="lg" variant='outline' onClick={() => {decision.current = false}}>
                    <p>{noPrompt}</p>
                </Button>
            </div>
        </CustomModal>
    );
});


export default ConfirmModal;