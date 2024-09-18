+++ title = 'Digital Logic'
summary = """
A basic framework for prototyping logical circuits with batteries included!
"""
date = 2024-05-23T11:05:46+07:00
tags = ['favorited']
terms = ['C++', 'SFML', 'Compiler', 'Computer Architecture']
+++

# 1. Introduction
I've always been curious about how computers worked at the hardware level, so when I saw [this](https://www.youtube.com/watch?v=QZwneRb-zqA&list=PLFt_AvWsXl0dPhqVsKt1Ni_46ARyiCGSq) video by Sebastian Lague where he explored how they work with visual aid from his own crafted simulator, I knew I had to try making my own.

# 2. Simulator Foundation
I started off by making a basic little logic library which will serve as the basic building block for the simulator. The library is very simple, only consisting of two elementary concepts: **pins** and **wires**. 

Simply:
- Pins have two states, on and off. 
- Pins can be connected to together by a wire, connecting a source to a destination. (indicating signal flow direction)

# 3. Pins
A component is composed of input pins, output pins and their sub-counter parts (exposed by internal sub-components). In my design, input and output pins share the same address space. In order to identify whether a pin is an input pin or an output pin, we employ a simple strategy. We can simply check whether the pin ID (index) is above a certain threshold, if it is then it is an output pin. This does imply that we can only have a limited number of input pins, but it isn't a big concern because the threshold can easily be changed.

# 4. Component Composition
A component is made up of pins, wires and sub-components. A simple instruction langauge (GATE) is introduced to help define component descriptions.

- `need [chip]` Ensures the image of the chip with the given name is known.
- `create [chip]` Declares a new chip with the given name and switches current context. Should be placed at the top of a definition file.
- `input [N]` Declares *N* inputs pins.
- `output [N]` Declares *N* outputs pins.
- `add [chip]` Add a sub-component with the given name to the current component. This implicitly adds new input and output pins.
- `wire [src] [dest]` Wire **src** and **dst** pins together.
- `precompute` Precompute the component, a truthtable is generated for future computations to reference from. This is only suitable with small arithmetic gates.
- `save` Save the current configuration. Should be placed at the end of the description file.

Obviously we can't build any logic only using only pins and wires. To introduce logic, the simulator comes bundled with a single built in component, the **nand** gate.

Here is how one might write a **not** gate description.

{{< highlight c >}}
# Make sure that nand's image is loaded 
need nand

# Set the name of the current component as not
create not

# Not gate only has 1 input and 1 output

# index 0
input 1

# index 255
output 1

# Only one sub-component
add nand

# Nand exposes 3 pins a, b and out
# which are indexed at 1, 2 and 256 respectively

# So our configuration is as follows:
# pin 0: global input pin
# pin 1: nand's first input pin
# pin 2: nand's second input pin
# pin 255: global output pin
# pin 256: nand's output pin

# Wires

# Connect global input into nand's a and b
wire 0 1
wire 0 2

# Connect nand's output to global output
wire 256 255

save
{{< /highlight >}}

# 5. Hardware Desc Language
Having to manually write component descriptions is error-prone and too cumbersome to be considered productive. This problem is mitigated by introducing another layer of abstraction which can help us streamline the process of component creation: the HDL. 

> Note: The HDL I implemented is based off the one used in the [nand2tetris](https://www.nand2tetris.org/) course.


The HDL is simple, consisting of only 5 keywords.
- `CHIP` For declaring a new chip
- `IN` For declaring a global input pin
- `OUT` For declaring a global output pin
- `PARTS` For defining sub-components and wiring
- `SERIALIZE` For precomputing components

Here is a revised **not** gate definition using HDL:
{{< highlight zig >}}
SERIALIZE CHIP not {
  IN in;
  OUT out;

  PARTS:
  nand(a=in, b=in, out=out);
}
{{< /highlight >}}
Resulting in the following:
{{< highlight c >}}
// THIS DEFINITION FILE IS AUTO GENERATED. DO NOT EDIT MANUALLY.

// DEPENDENCIES.
need nand

// BEGINNING OF GATE DECLARATION.
create not

// GLOBAL INPUT PINS.
// INPUT PINS MAPPING.
//  0 in
input 1

// GLOBAL OUTPUT PINS.
// OUTPUT PINS MAPPING.
// 255 out
output 1

// SUBGATES.
add nand

// LINKAGES.
wire 0 1
wire 0 2
wire 256 255

// SERIALIZATION.
precompute

// DEFINITION COMPLETE.
save

// END OF FILE.
{{< /highlight >}}
A meta file is also generated in order to retain contextual information about the component.
{{< highlight c >}}
// THIS META FILE IS AUTO GENERATED. DO NOT EDIT MANUALLY.

// GATE NAME.
not

// BUSES DECLARATION.
BUSES 0

// GLOBAL INPUT PINS.
INPUTS 1
in

// GLOBAL OUTPUT PINS.
OUTPUTS 1
out

// END OF FILE.
{{< /highlight >}}
> One implementation note to take into consideration is that, the HDL's filename *should* be exactly the same as the component's name.
# 6. Naming & Dynamic Linking
The HDL introduces two useful abstractions: pin naming and dynamic linking.

Pin naming is as simple as the name implies. Instead of having to bookkeep pin indicies and keep track of what they are, we can refer to pins directly by name.

Dynamic linking allows us to store results computed from components and feed them into other components, allowing for chained computation.

We can see both of these two abstractions in action in the following example. 
{{< highlight c >}}
// Note: Using the not gate, defined previously
SERIALIZE CHIP and {
  IN a, b;
  OUT out;

  PARTS:
  // dynamically create the value 'temp'
  nand(a=a, b=b, out=temp);

  // feed temp into not, wiring nand.out to not.in
  not(in=temp, out=out);
}
{{< /highlight >}}
# 7. Bus
A bus is an array of pins which we treat as one single pin. Notice that the underlying library has no concept of buses, the logic for declaring and wiring buses is entirely achieved by the compiler. 

Here is an example of how **not4** could be implemented.
{{< highlight zig >}}
SERIALIZE CHIP not4 {
  IN in[4];   //< Notice the array syntax
  OUT out[4]; //<

  PARTS:
  not(in=in[0], out=out[0]);
  not(in=in[1], out=out[1]);
  not(in=in[2], out=out[2]);
  not(in=in[3], out=out[3]);
}
{{< /highlight >}}
And now we can define something like this:
{{< highlight zig >}}
// Note: This is just for demonstration (not really useful)
SERIALIZE CHIP bus4 {
  IN in[4];
  OUT out[4];

  PARTS:
  // Negate input, save result into out1
  // Note that if the bus size of not4.in isn't 4, 
  // this will cause a compile error
  not4(in=in, out=out1);

  // Negate out1, send result to out
  not4(in=out1, out=out);
}
{{< /highlight >}}
# 8. Testing
Correctness is extremely important when developing anything, and ofcourse, components are no different. Since they are expected to behave in a predictable manner, it is a no-brainer that testing facilities should be provided.

Tests can be written using only 7 keywords.
- `LOAD [chip]` Loads the specified chip.
- `TEST [test name]` Declare a new test.
- `VAR [name]: [chip]` Declare a new variable.
- `SET [name].[member] = [value]` Set a component member value.
- `EVAL` Simulate for one tick.
- `REQUIRE [condition]` Assert condition.
- `AND [condition]` Chaining conditions.

Here is an example of how a `not` gate could be tested.
{{< highlight lua >}}
LOAD not;

TEST 'not 0' {
  VAR n: not;
  SET n.in = 0;
  EVAL;
  REQUIRE n.in IS 0 AND n.out IS 1;
}

TEST 'not 1' {
  VAR n: not;
  SET n.in = 1;
  EVAL;
  REQUIRE n.in IS 1 AND n.out IS 0;
}
{{< /highlight >}}
# 9. CLI
The CLI contains basic commands you'd expect.

> Note: Test scripts and HDL scripts are stored in `root`/`scripts`/ with `.tst` and `.hdl` respectively.

|Command|Description|
|-------|-----------|
| `help` | Show commands. |
| `compile [chip]` | Compile HDL file. Specify `all` to compile all HDL files. |
| `gui` | Start gui mode. |
| `info` | Display basic information about the simulator |
| `list` | List all components defined in the simulator. |
| `load [chip]` | Load component image. |
| `serialize [chip]` | Generate truthtable for the component. |
| `test [chip]` | Run test. Specify `all` to run all test files. |
| `quit` | Exit the simulator. |
# 10. GUI
A basic GUI is provided for users to prototype components. At first, creation of new component via GUI was possible, but was removed after the introducted of buses, since they aren't supported by the GUI (they show up as an array of pins). The GUI mode is recommended to only be used for demonstrative/visualization purposes.

The GUI contains two basic parts, the `prototype board` where users can drop components and wire them up, and the `toolbelt` which allows to user to search and select components to add to the board.

By default, the user is in `edit mode`. To create a component, the user can click on the *left hand side* of the `prototype board` to add global input pins, and similarly, they can click the *right hand side* for global output pins. Then they can nagivate to the `toolbelt`, search up their desired component, click on it and place it where they want it on the `prototype board`. Then they can enter `wire mode` and wire pins together. The `prototype board` is always simulating, so to test the behavior of their component, they can simply toggle the global input pins.

Keybinds:
- `E` Toggle between `edit` and `wire` mode.
- `C` Clear the `prototype board`

![digital-sim](https://github.com/TheGreatWaves/Digital-Logic-SFML/assets/106456906/abf0ab66-ec0c-4595-8169-20cb7cccebf0)

# 11. Creating a Computer

Now that the framework is complete, we can actually now begin to create something out of it. More specifically, we can try creating a working computer! 

## 11.1 Elementary Logic Gates
Welcome to the start line! Here, our first goal is to simply create components which allows us to perform boolean logic.

More specfically, we'll be creating:
- not,
- and,
- or,
- xor,
- mux,
- dmux. 

While these might not seem like the most exciting components, they are crucial in laying the ground work for creating larger more complex components by providing us with the first level of abstraction!

### Not
The `not` gate simply takes in a signal and return the opposite value.
{{< highlight zig >}}
SERIALIZE CHIP not {
	IN in;
	OUT out;

	PARTS:
	nand(a=in, b=in, out=out);
}
{{< /highlight >}}
### And
The `and` gate takes in two input and returns positive when both are active.
{{< highlight zig >}}
// To implement `and`, we can simply feed our two 
// inputs into `nand` and negate the output using `not`.
SERIALIZE CHIP and {
	IN a, b;
	OUT out;

	PARTS:
	nand(a=a, b=b, out=nand_out);
    not(in=nand_out, out=out);
}
{{< /highlight >}}
### Or
The `or` gate takes in two input and returns positive when atleast one is positive.
{{< highlight zig >}}
// To implement `and`, we can simply feed our two 
// inputs into `nand` and negate the output using `not`.
SERIALIZE CHIP or {
	IN a, b;
	OUT out;

	PARTS:
	not(in=a, out=tmp1);
	not(in=b, out=tmp2);
	nand(a=tmp1, b=tmp2, out=out);
}
{{< /highlight >}}


<!-- TODO: Complete below -->
<!-- ### Not -->
<!-- ### And -->
<!-- ### Or -->
<!-- ### Xor -->
<!-- ### Mux -->
<!-- ### Dmux -->

<!-- ## 11.2 Boolean Arithmetic Gates -->
<!-- ### Half Adder -->
<!-- ### Full Adder -->
<!-- ### Add16 -->
<!-- ### Increment -->
<!-- ### Arithmetic Logic Unit -->

<!-- ## 11.3 Memory Gates -->
<!-- ### Data Flip Flop -->
<!-- ### Bit -->
<!-- ### Register -->
<!-- ### Ram -->
<!-- ### Program Counter -->

<!-- ## 11.4 CPU Architecture -->

<!-- ## 11.5 Computer Architecture -->

<!-- # 12. Emulator -->
<!-- An eumlator of the computer is also implemented in order to test without having to worry about performance of the underlying logic library. -->

<!-- Future work is required to be able to swap in the emulator with the actual implementation of the computer. -->

<!-- # 13. Building a Language -->

<!-- # 14. Building an OS -->
