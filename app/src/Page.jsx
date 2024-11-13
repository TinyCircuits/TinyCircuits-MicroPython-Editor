import { useEffect } from "react";
import { Theme } from "react-daisyui";


function PageHeaderContents(props){
    return(
        <>
            {props.children}
        </>
    );
}

function PageBodyContents(props){
    return(
        <>
            {props.children}
        </>
    );
}

function PageFooterContents(props){
    return(
        <>
            {props.children}
        </>
    );
}

function PageModalContents(props){
    return(
        <>
            {props.children}
        </>
    );
}


// Because component names get minifed, the order of children dictates
// where they go inside the parent page component
function Page(props){
    const {className, children} = props;

    return(
        <Theme dataTheme="dim" className={"absolute left-0 right-0 top-0 bottom-0 flex flex-col overflex-hidden" + " " + className}>
            {children.length == 4 ? children[0] : <></>}

            <div className="w-full h-16">
                {children.length == 4 ? children[1] : children[0]}
            </div>

            <div className="w-full h-full">
                {children.length == 4 ? children[2] : children[1]}
            </div>

            <div className="w-full h-9 bg-base-200">
                {children.length == 4 ? children[3] : children[2]}
            </div>
        </Theme>
    );
}


export default Page;
export {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents};