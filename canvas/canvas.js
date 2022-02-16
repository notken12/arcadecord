import Canvas, { loadImage } from 'canvas';

const canvas = Canvas.createCanvas(400,400);
const ctx = canvas.getContext("2d")

function Component(x, y, width, height, options){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.options = options;
    this.options.type = this.options.type || "rectangle";
    this.options.color = this.options.color || "red";
    this.options.filled = this.options.filled || true;
    this.options.outlined = this.options.outlined || false;
    this.options.opacity = this.options.opacity || 1;
    /*
    type: string, required, default-rectangle
    color: string, required, default-red
    filled: boolean, required, default-true
    outlined: boolean, required, default-false
    opacity: num(0-1), optional, default-1
    outlineColor: string, optional, default-black
    imageSource: string, optional, default-NO DEFAULT

    */

    this.draw = function(){
        switch(this.options.type){
            case "rectangle":
                if(this.options.filled){
                    ctx.fillStyle = this.options.color;
                    ctx.fillRect(this.x, this.y, this.width, this.height)
                }
                if(this.options.outlined){
                    ctx.strokeStyle = this.options.outlineColor || "black";
                    ctx.strokeRect(this.x, this.y, this.width, this.height)
                }
            break;

            case "image":
            if(this.options.imageSource){
                let image = await Canvas.loadImage(this.options.imageSource)
                ctx.drawImage(image, this.x, this.y, this.width, this.height)
            } else {
                throw new Error("Image has no source!")
            }
            break;
        }
    }
}

function finishCanvas(){
    return canvas;
}

export default {
    Component,
    finishCanvas,
    canvas,
    ctx
}