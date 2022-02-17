import Canvas from 'canvas';

function Component(x, y, width, height, options){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.options = options;
    this.options.type = this.options.type || "rectangle";
    this.options.color = this.options.color || "red";
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
}

function newCanvas(width, height){
    return new canvas(width, height)
}
function canvas(width, height){
    this.canvas = Canvas.createCanvas(width, height)
    this.ctx = this.canvas.getContext("2d")

    this.draw = function(comp){
        switch(comp.options.type){
            case "rectangle":
                this.ctx.globalAlpha = comp.options.opacity;
                this.ctx.fillStyle = comp.options.color
                this.ctx.fillRect(comp.x, comp.y, comp.width, comp.height)
            break;

            case "image":
            
            break;

            case "ellipse":
            
            break;
        }
    }
    this.toBuffer = function(){
        return this.canvas.toBuffer()
    }
}

export default {
    Component,
    newCanvas,
    canvas
}