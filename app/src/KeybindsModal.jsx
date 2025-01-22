import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { Button, Modal, Input, Checkbox} from 'react-daisyui'
import CustomModal from './CustomModal';
import keybinds from './Keybinds';


let KeybindsModal = forwardRef(function KeybindsModal(props, ref){
    const customModalRef = useRef(null);

    useImperativeHandle(ref, () => ({
        showModal(){
            customModalRef.current.showModal();
        },
        close(){
            customModalRef.current.close();
        },
    }), []);

    useEffect(() => {
        customModalRef.current.showModal();
    }, []);

    return(
        <CustomModal title="Simulator Keybinds" ref={customModalRef}>
            <>
            </>      
        </CustomModal>
    );
});


export default KeybindsModal;