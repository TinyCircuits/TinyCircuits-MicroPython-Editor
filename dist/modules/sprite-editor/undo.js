class Undo{
    constructor(){
        this.history = [];
        this.position = 0;
    }

    value(){
        return this.history[this.position];
    }

    setValue(value){
        if (this.position < this.history.length - 1) {
            this.history = this.history.slice(0, this.position + 1);
        }
        this.history.push(value);
        this.position += 1;
    }

    increment(value){
        this.setValue(value);
    }

    decrement(){
        this.setValue(this.value() - 1);
    }

    undo(){
        if (this.position > 0) {
            this.position -= 1;
        }
    }

    redo(){
        if (this.position < this.history.length - 1) {
            this.position += 1;
        }
    }
}

export { Undo }