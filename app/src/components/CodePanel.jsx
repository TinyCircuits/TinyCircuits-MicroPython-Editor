import { useEffect, useMemo, useRef, useState } from 'react';
import { useCodeMirror } from '@uiw/react-codemirror';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';


function CodePanel(props){
    const handleOnChange = (value, viewUpdate) => {
        props.editorValues[props.path] = value;
        props.onCodeEditorChanged(props.path);
    }

    const getEditorValue = () => {
        return props.editorValues[props.path];
    }

    const handleLookForSaveKeyPress = (event) => {
        if(event.ctrlKey && event.key == "s"){
            event.preventDefault();
            props.onCodeEditorSaved(props.path, props.editorValues[props.path]);
        }
    }

    return(
        <div className='h-full w-full' onKeyDown={handleLookForSaveKeyPress}>
            <CodeMirror onChange={handleOnChange} value={getEditorValue()} className='h-full w-full' height='100%' theme="dark" extensions={[python({ })]} />
        </div>
    );
}


export default CodePanel;