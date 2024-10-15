import { useRef, useEffect } from 'react';
import { Button, Modal } from 'react-daisyui'


function SelectLocationModal(props){
    const {runPathDevice, runPathSimulator, runAfterLocationSelect, setRunAfterLocationSelect} = props;

    const modalRef = useRef(null);

    useEffect(() => {
        if(runAfterLocationSelect != undefined){
            modalRef.current.showModal();
        }
    });

    return(
        <Modal ref={modalRef}>
            <Modal.Header className="font-bold">Select Run Location Folder:</Modal.Header>
            <Modal.Body>
                test
            </Modal.Body>

            <Modal.Actions>
                <form method="dialog">
                    <Button onClick={() => {setRunAfterLocationSelect(undefined)}}>Close</Button>
                </form>
            </Modal.Actions>
        </Modal>
    );
}


export default SelectLocationModal;