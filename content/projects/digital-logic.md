+++ title = 'Digital Logic'
summary = """
A basic framework for prototyping logical circuits with batteries included!
"""
date = 2024-05-23T11:05:46+07:00
tags = ['favorited']
terms = ['C++', 'SFML', 'Computer Architecture', 'Compiler']
+++

# Introduction
I've always been curious about how computers worked at the hardware level, so when I saw [this](https://www.youtube.com/watch?v=QZwneRb-zqA&list=PLFt_AvWsXl0dPhqVsKt1Ni_46ARyiCGSq) video by Sebastian Lague where he explored how they work with visual aid from his own crafted simulator, I knew I had to try making my own.

# Simulator Foundation
I started off by making a basic little logic library which will serve as basic building block for the simulator. The library is very simple, only consisting of two elementary concepts: **pins** and **wires**. 

Simply:
- Pins have two states, on and off. 
- Pins can be connected to together via a wire, connecting a source to a destination. (indicating signal flow direction)

# Pins
A component is composed of input pins, output pins and their sub-counter parts (exposed by internal subgates). In my design, input and output pins share the same address space. In order to identify whether a pin is an input pin or an output pin, we employ a simple strategy. We can simply check whether the pin ID (index) is above a certain threshold, if it is then it is an output pin. This does imply that we can only have a limited number of input pins, but it isn't a big concern because the threshold can easily be changed.

# Component Composition
A component is made up of pins, wires and subgates. A simple instruction langauge (GATE) is introduced to help define component descriptions.

- **need \[chip\]**: Ensures the image of the chip with the given name is known.
- **create \[chip\]**: Declares a new chip with the given name and switches current context. Should be placed at the top of a definition file.
- **input \[N\]**: Declares *N* inputs pins.
- **output \[N\]**: Declares *N* outputs pins.
- **add \[chip\]**: Add a subchip with the given name to the current chip. This implicitly adds new input and output pins.
- **wire \[src\] \[dest\]**: Wire **src** and **dst** pins together.
- **precompute**: Precompute the component, a truthtable is generated for future computations to reference from. This is only suitable with small arithmetic gates.
- **save**: Save the current configuration. Should be placed at the end of the description file.

Obviously we can't build any logic only using only pins and wires. To introduce logic, the simulator comes bundled with a single built in component, the **nand** gate.


