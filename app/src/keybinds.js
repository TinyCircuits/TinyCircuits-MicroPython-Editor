import { createContext } from "react";

class Keybinds{
    constructor(){
        const defaultKeybinds = {
            "up":          "w",
            "down":        "s",
            "left":        "a",
            "right":       "d",
            "a":           ".",
            "b":           ",",
            "left_bumper": "Shift",
            "right_bumper": " ",
            "menu":         "Enter"
        }

        this.keybinds = localStorage.getItem("keybinds");

        if(this.keybinds == null){
            this.keybinds = defaultKeybinds;
        }else{
            this.keybinds = JSON.parse(keybinds);
        }
    }

    // Returns `true` if for the given direction the
    // passed key matches the key for that direction
    check(direction, key){
        const directionKey = this.keybinds[direction];
        return directionKey == key;
    }

    // Set the key for a direction and store
    set(direction, key){
        this.keybinds[direction] = key;
        localStorage.setItem("keybinds", JSON.stringify(this.keybinds));
    }
}

const keybinds = new Keybinds();

export default keybinds;