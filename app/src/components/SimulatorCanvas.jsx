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
            
            ctx.current.fillStyle = "black";
            ctx.current.fillRect(0, 0, 128, 128);
            ctx.current.translate((128)/2, (128)/2);

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

                createImageBitmap(imageData.current).then((imageBitmap) => {
                    // ctx.current.drawImage(imageBitmap, 0, 0, 128*scale, 128*scale);
                    ctx.current.drawImage(imageBitmap, -128/2, -128/2, 128, 128);
                });

                ctx.current.imageSmoothingEnabled = false;
                ctx.current.mozImageSmoothingEnabled = false;
                ctx.current.oImageSmoothingEnabled = false;
                ctx.current.webkitImageSmoothingEnabled = false;
                ctx.current.msImageSmoothingEnabled = false;

                // ctx.current.putImageData(imageData.current, 0, 0, 0, 0, 256, 256);
            }

            requestAnimationFrame(render);
        },
        toDataURL(){
            return canvas.current.toDataURL();
        },
        captureStream(){
            return canvas.current.captureStream();
        },
        setTransformation(scale, rotation){
            canvasRef.current.width = 128 * scale;
            canvasRef.current.height = 128 * scale;
            ctx.current.translate((128*scale)/2, (128*scale)/2);
            ctx.current.rotate(rotation * Math.PI / 180);
            ctx.current.scale(scale, scale);
        }
    }))


    return(
        <canvas ref={canvasRef} width="128" height="128" className="w-96 aspect-square emulator_canvas">
            Canvas that displays simulator frames
        </canvas>
    );
});


export default SimulatorCanvas;