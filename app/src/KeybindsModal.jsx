import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { Button, Modal, Input, Checkbox, Join} from 'react-daisyui'
import CustomModal from './CustomModal';
import keybinds, { KeybindDirections } from './Keybinds';

function Key(props){
    const {title, direction} = props;

    const [binding, setBinding] = useState(false);

    const startBinding = () => {
        console.log("Binding", title);
        setBinding(true);

        let listenCB = (event) => {
            console.log(event.key);
            window.removeEventListener("keydown", listenCB);
            keybinds.set(direction, event.key);
            setBinding(false);
        }

        window.addEventListener("keydown", listenCB);
    }

    return(
        <Join className='my-1 flex w-full'>
            <div className='flex-1 flex items-center'>
                <span className='m-auto mr-4'>{title}:</span>
            </div>
            <div className='flex-1 flex items-center'>
                <Button size='sm' color='secondary' className='w-14' onClick={startBinding}>{binding ? "<press>" : keybinds.get(direction)}</Button>
            </div>
        </Join>
    )
}


let KeybindsModal = forwardRef(function KeybindsModal(props, ref){
    const customModalRef = useRef(null);
    const [render, setRender] = useState(0);

    useImperativeHandle(ref, () => ({
        showModal(){
            customModalRef.current.showModal();
        },
        close(){
            customModalRef.current.close();
        },
    }), []);

    return(
        <CustomModal title="Simulator Keybinds" ref={customModalRef}>
            <div className='w-full h-full flex flex-col items-center justify-center'>
                <Key title="Up"           direction={KeybindDirections.UP}/>
                <Key title="Left"         direction={KeybindDirections.LEFT}/>
                <Key title="Down"         direction={KeybindDirections.DOWN}/>
                <Key title="Right"        direction={KeybindDirections.RIGHT}/>

                <Key title="A"            direction={KeybindDirections.A}/>
                <Key title="B"            direction={KeybindDirections.B}/>

                <Key title="Left Bumper"  direction={KeybindDirections.LEFT_BUMPER}/>
                <Key title="Right Bumper" direction={KeybindDirections.RIGHT_BUMPER}/>

                <Key title="Menu"         direction={KeybindDirections.MENU}/>

                <Button size='sm' color='primary' className='m-2' onClick={() => {keybinds.reset(); setRender(Math.random())}}>
                    Reset
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>
                    </svg>
                </Button>
            </div>      
        </CustomModal>
    );
});


export default KeybindsModal;