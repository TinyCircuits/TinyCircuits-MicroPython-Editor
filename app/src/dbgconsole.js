const DEBUG = false;
const trace = false;

export default function dbgconsole(...args){
    if(DEBUG){
        if(trace){
            console.trace("DEBUG:", ...args);
        }else{
            console.log("DEBUG:", ...args);
        }
    }
}