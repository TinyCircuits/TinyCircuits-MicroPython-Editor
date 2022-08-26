import { Emulator } from "../../../modules/emulator/emulator.js";

let emulator = new Emulator();

const canvasEmulatorParent = document.getElementById("canvasEmulatorParent");
const canvasEmulator = document.getElementById("canvasEmulator");
const ratio = parseInt(canvasEmulator.width) / parseInt(canvasEmulator.height);


let resize = () => {
    const parentSize = canvasEmulatorParent.getBoundingClientRect();

    const ratioX = parentSize.width / canvasEmulator.width;
    const ratioY = parentSize.height / canvasEmulator.height;
    const ratio1 = Math.min(ratioX, ratioY);
    const ratio2 = Math.max(ratioX, ratioY);

    canvasEmulator.style.width = ((ratio1 * canvasEmulator.width)) + "px";
    canvasEmulator.style.height = ((ratio1 * canvasEmulator.height)) + "px";
}


let windowObserver = new ResizeObserver((entries) => resize());
windowObserver.observe(canvasEmulatorParent);