class Repl{
    constructor(){

    }


    // Main data consumer, data comes here from serial before being output again
    consumeData(data){
        console.log(data);
    }
}

export { Repl }