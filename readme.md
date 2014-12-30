# About
Aurora is a modular raspberry pi ambilight solution easly costumiseable through
a simple-to-use web interface.
It is modular and fairly simple to extend. It supports multiple animations and adapters.
This project was inspired by the [PiFx](https://github.com/andrewmunsell/PiFX) project.

# Table of Contents
  * [Demonstration](#demonstration)
  * [Installation](#installation)
    * [Software](#installation)
    * [Hardware](#installation)
  * [Animations](#animations)
  * [Adapters](#adapters)
  * [Contributing](#animations)

# Demonstration
`TODO:` Add demonstrational video

# Installation
`TODO:` Write a preface
### Software
`TODO:` Write instructions
### Wiring
`TODO:` Write instructions

# Animations
Everything is an animation. Even the simple solid color preset is an animation. This enables the creation of very complex animations without the need to extend the core componenets.
### Anatomy of an animation
Every animation has two basic componenets a view (located in `views/animations`) and a script located in `animations/`.

The script file contains all the logic for your animation.
Every animation is a __Node.js module__. By default the animation controller will load all `.js` files in the `animations/` folder so if you have any external scripts put them in a seperate subfolder.

Every animation __has to export__ the folowing properties:
  * __id__ - a string that will uniquely identify the animation (no spaces allowed, snake case preffered)
  * __name__ - a string containing the human readable name of the animation
  * __adapter__ - aa array of strings containing the names of the adapters compatible with this animation
  * __options__ - a function that returns all the available options or sets them if an object containing some options is passed to it
  * __tick__ - a function that accepts an array and updates it with the animation's logic for every frame

Optionally you can have more properties.

The `tick` function is the center piece of every animation. It accepts an
array with the current state/colors of the adapter and modifies them.
The elements of the array depend on the adaper. For more information please examine the `solidColor.js` and `colorWheel.js` animations as they are examples of simple animations.

# Adapters
Adapter are interfaces between the animations and the hardware. They take the state array and write the colors to the hardware driving the LEDs.

### Anatomy of an adapter
`TODO:` Write...

# Contributing
`TODO:` Write something smart
