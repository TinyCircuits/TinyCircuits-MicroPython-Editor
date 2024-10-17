
function AddPanel(props){
    return (
        <div className="w-full h-full flex bg-accent">
            {props.choseComputer ? "yes" : "no"}
        </div>
    );
}


export default AddPanel;