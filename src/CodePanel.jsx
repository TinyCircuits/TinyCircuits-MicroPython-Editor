import { useEffect, useMemo, useRef, useState } from 'react';
import { useCodeMirror } from '@uiw/react-codemirror';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';


function CodePanel(props){
    const [value, setValue] = useState("");

    useEffect(() => {
        props.openFile(props.path).then((file_contents) => {
            setValue(file_contents);
            console.log("Editor value set!");
        })
    });

    return(
        <div className='h-full w-full'>
            <CodeMirror value={value} className='h-full w-full' height='100%' theme="dark" extensions={[python({ })]} />
        </div>
    );
}


// // https://github.com/uiwjs/react-codemirror?tab=readme-ov-file#support-hook
// const extensions = [python({ })];


// function CodePanel(props){
//     const editor = useRef();

//     const { setContainer } = useCodeMirror({
//         container: editor.current,
//         extensions,
//         value: "import os",
//         theme: "dark",
//     });

//     useEffect(() => {
//         if (editor.current){
//             setContainer(editor.current);
//             console.log(editor.current.children);
//             // editor.current.children[0].className += " w-full h-full"
//         }
//     }, [editor.current]);

//     return(
//         <div ref={editor} className='w-full h-full'>

//         </div>
//     );
// }

export default CodePanel;