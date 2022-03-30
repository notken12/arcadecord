// canvas.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import Canvas from 'canvas'

function Component(x, y, width, height, options) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  this.options = options
  this.options.type = this.options.type || 'rectangle'
  this.options.color = this.options.color || 'red'
  this.options.opacity = this.options.opacity || 1

  this.options.sx = this.options.sx || this.x
  this.options.sy = this.options.sy || this.y
  this.options.swidth = this.options.swidth || this.width
  this.options.sheight = this.options.sheight || this.height
  /*
    type: string, required, default-rectangle
    color: string, required, default-red
    filled: boolean, required, default-true
    outlined: boolean, required, default-false
    opacity: num(0-1), optional, default-1
    outlineColor: string, optional, default-black
    imageSource: string, optional, default-NO DEFAULT

    //FOR IMAGES ONLY {
        sx: number, required, default-this.x
        sy: number, required, default-this.y
        swidth: number, required, default-this.width
        sheight: number, required, default-this.height


    (x, y)              width
        o-------------------------------------
        |.....................................
        |...(sx,sy)......swidth...............
      h |.......o---------------------........
      e |.......|.............................
      i |.....s.|.............................
      g |.....h.|.............................
      h |.....e.|.............................
      t |.....i.|.............................
        |.....g.|.............................
        |.....h.|.............................
        |.....t.|.............................
        ---------------------------------------

    }
    */
}

function newCanvas(width, height) {
  return new canvas(width, height)
}
function canvas(width, height) {
  this.canvas = Canvas.createCanvas(width, height)
  this.ctx = this.canvas.getContext('2d')

  this.draw = async function (comp) {
    switch (comp.options.type) {
      case 'rectangle':
        this.ctx.globalAlpha = comp.options.opacity
        this.ctx.fillStyle = comp.options.color
        this.ctx.fillRect(comp.x, comp.y, comp.width, comp.height)
        break

      case 'image':
        if (comp.options.imageSource) {
          Canvas.loadImage(
            import.meta.url + '/../' + comp.options.imageSource
          ).then((image) => {
            this.ctx.drawImage(
              image,
              comp.sx,
              comp.sy,
              comp.swidth,
              comp.sheight,
              comp.x,
              comp.y,
              comp.width,
              comp.height
            )
          })
        }
        break

      case 'ellipse':
        break
    }
  }
  this.toBuffer = function () {
    return this.canvas.toBuffer()
  }
}

export default {
  Component,
  newCanvas,
  canvas,
}
