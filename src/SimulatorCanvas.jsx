import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";



const SimulatorCanvas = forwardRef(function SimulatorCanvas(props, ref){
    let canvasRef = useRef(undefined);
    let canvas = useRef(undefined);
    let ctx = useRef(undefined);

    // Setup canvas once
    useEffect(() => {
        if(canvas.current == undefined){
            console.log("Setting up simulator canvas!");

            canvas.current = canvasRef.current;
            ref = this;
            ctx.current = canvas.current.getContext("2d");

            canvas.current.style.cssText = "width:512px; height:512px; image-rendering:optimizeQuality; image-rendering:-moz-crisp-edges; image-rendering:-webkit-optimize-contrast; image-rendering:-o-crisp-edges; image-rendering:pixelated; -ms-interpolation-mode:nearest-neighbor;";

            ctx.current.imageSmoothingEnabled = false;
            ctx.current.mozImageSmoothingEnabled = false;
            ctx.current.oImageSmoothingEnabled = false;
            ctx.current.webkitImageSmoothingEnabled = false;
            ctx.current.msImageSmoothingEnabled = false;

            ctx.current.fillStyle = "black";
            ctx.current.fillRect(0, 0, 128, 128);
        }
    }, []);

    useImperativeHandle(ref, () => ({
        update(RGB565Buffer){
            let screenArray = new Uint8ClampedArray(128*128 * 4);    // Each pixel is 4 bytes, R,G,B,A

            for(let ipx=0; ipx<128*128; ipx++){
                let RGB565_16BIT = 0;
                RGB565_16BIT |= (RGB565Buffer[(ipx*2)+1]) << 8;
                RGB565_16BIT |= (RGB565Buffer[(ipx*2)]) << 0;

                let R_5BIT = (RGB565_16BIT >> 11) & 0b00011111;
                let G_6BIT = (RGB565_16BIT >> 5)  & 0b00111111;
                let B_5BIT = (RGB565_16BIT >> 0)  & 0b00011111;

                screenArray[(ipx*4)] =   R_5BIT << 3;
                screenArray[(ipx*4)+1] = G_6BIT << 2;
                screenArray[(ipx*4)+2] = B_5BIT << 3;
                screenArray[(ipx*4)+3] = 255;
            }

            // let imageData = new ImageData(screenArray, 128, 128);
            // let imageBitmap = await createImageBitmap(imageData, 0, 0, 128, 128);
            // ctx.current.drawImage(imageBitmap, 0, 0);

            let imageData = new ImageData(screenArray, 128, 128);
            ctx.current.putImageData(imageData, 0, 0);
        },
    }))

    return(
        <canvas ref={canvasRef} width="128" height="128" className="w-96 aspect-square">
            Canvas that displays simulator frames
        </canvas>
    );
});


export default SimulatorCanvas;