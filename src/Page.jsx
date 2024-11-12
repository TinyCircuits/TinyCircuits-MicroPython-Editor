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


function Page(props){
    const {className, children} = props;

    const getChildElement = (typeName) => {
        for(let i=0; i<children.length; i++){
            if(children[i].type != undefined && children[i].type.name == typeName){
                let child = children[i];
                return child;
            }
        }
    }

    return(
        <Theme dataTheme="dim" className={"absolute left-0 right-0 top-0 bottom-0 flex flex-col overflex-hidden" + " " + className}>
            {getChildElement("PageModalContents")}

            <div className="w-full h-16">
                {getChildElement("PageHeaderContents")}
            </div>

            <div className="w-full h-full">
                {getChildElement("PageBodyContents")}
            </div>

            <div className="w-full h-9 bg-base-200">
                {getChildElement("PageFooterContents")}
            </div>
        </Theme>
    );
}


export default Page;
export {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents};