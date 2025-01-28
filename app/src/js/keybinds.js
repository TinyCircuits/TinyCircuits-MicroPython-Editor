import { createContext } from "react";

export const KeybindDirections = {
    UP:          "up",
    DOWN:        "down",
    LEFT:        "left",
    RIGHT:       "right",
    A:           "a",
    B:           "b",
    LEFT_BUMPER: "left_bumper",
    RIGHT_BUMPER: "right_bumper",
    MENU:         "menu"
}

class Keybinds{
    constructor(){
        this.defaultKeybinds = {
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

        if(this.keybinds == null || this.keybinds == "undefined"){
            this.keybinds = this.defaultKeybinds;
        }else{
            this.keybinds = JSON.parse(this.keybinds);
        }
    }

    // Returns `true` if for the given direction the
    // passed key matches the key for that direction
    check(direction, key){
        const directionKey = this.keybinds[direction];
        return directionKey == key;
    }

    get(direction){
        console.log("Getting", direction, "key");
        return this.keybinds[direction];
    }

    // Set the key for a direction and store
    set(direction, key){
        this.keybinds[direction] = key;
        localStorage.setItem("keybinds", JSON.stringify(this.keybinds));
    }

    reset(){
        this.keybinds = this.defaultKeybinds;
        localStorage.setItem("keybinds", JSON.stringify(this.keybinds));
    }
}

const keybinds = new Keybinds();

export default keybinds;