import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";



const SimulatorCanvas = forwardRef(function SimulatorCanvas(props, ref){
    let canvasRef = useRef(undefined);
    let canvas = useRef(undefined);
    let ctx = useRef(undefined);
    let imageData = useRef(undefined);


    // Setup canvas once
    useEffect(() => {
        console.log("Created simulator canvas!");

        if(canvas.current == undefined){
            console.log("Setting up simulator canvas!");

            canvas.current = canvasRef.current;
            ref = this;
            ctx.current = canvas.current.getContext("2d", { alpha: false });    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#turn_off_transparency

            canvas.current.style.cssText = "width:512px; height:512px; image-rendering:optimizeQuality; image-rendering:-moz-crisp-edges; image-rendering:-webkit-optimize-contrast; image-rendering:-o-crisp-edges; image-rendering:pixelated; -ms-interpolation-mode:nearest-neighbor;";

            ctx.current.imageSmoothingEnabled = false;
            ctx.current.mozImageSmoothingEnabled = false;
            ctx.current.oImageSmoothingEnabled = false;
            ctx.current.webkitImageSmoothingEnabled = false;
            ctx.current.msImageSmoothingEnabled = false;

            ctx.current.fillStyle = "black";
            ctx.current.fillRect(0, 0, 128, 128);

            imageData.current = new ImageData(128, 128);    // Each pixel is 4 bytes, R,G,B,A
        }
    }, []);


    useImperativeHandle(ref, () => ({
        async update(RGB565Buffer){
            let render = () => {
                for(let ipx=0; ipx<128*128; ipx++){
                    let RGB565_16BIT = 0;
                    RGB565_16BIT |= (RGB565Buffer[(ipx*2)+1]) << 8;
                    RGB565_16BIT |= (RGB565Buffer[(ipx*2)]) << 0;

                    let R_5BIT = (RGB565_16BIT >> 11) & 0b00011111;
                    let G_6BIT = (RGB565_16BIT >> 5)  & 0b00111111;
                    let B_5BIT = (RGB565_16BIT >> 0)  & 0b00011111;

                    imageData.current.data[(ipx*4)] =   R_5BIT << 3;
                    imageData.current.data[(ipx*4)+1] = G_6BIT << 2;
                    imageData.current.data[(ipx*4)+2] = B_5BIT << 3;
                    imageData.current.data[(ipx*4)+3] = 255;
                }

                // let imageBitmap = await createImageBitmap(imageData.current, 0, 0, 128, 128);
                // ctx.current.drawImage(imageBitmap, 0, 0);

                ctx.current.putImageData(imageData.current, 0, 0);
            }

            requestAnimationFrame(render);
        },
    }))


    return(
        <canvas ref={canvasRef} width="128" height="128" className="w-96 aspect-square">
            Canvas that displays simulator frames
        </canvas>
    );
});


export default SimulatorCanvas;