+++
title = 'Macten'
date = 2024-05-23T14:46:26+07:00
draft = false
summary = "A powerful macro processor with declarative and procedural options, using clear modern syntax."
terms = ['C++', 'Python', 'Macro', 'Transpiler']
tags = ['favorited']
+++

# 1. Introduction
I was first exposed to macros in the form of the `#define` directive which can be found in the `C` programming language. Initially, I was puzzled as to why such a feature would be useful, however as time passed and as I gain more experience, I began to appreciate it more and more. (despite its very apparent flaws and limitations)

I was frustrated to find out that other languages like `Java` and `Python` lacked any macro features (though, of course, they have constructs which replicate macro behavior). I am fully aware that languages like `C` needed macros, but the same cannot be said for other languages.

For a while my idea of a macro was limited to simply token substitution and token gluing. However, after learning `Rust` and experiencing its `procedural` macros, I learnt that macros could do so much more.

# 2. Objective
The aim of this project is to develop a generic macro preprocessor that combines the established functionalities of token substitution and gluing (offered by tools like [GNU M4](https://www.gnu.org/software/m4/) and [GPP](https://github.com/logological/gpp?tab=readme-ov-file)) with the capabilities of procedural macros.
# 3. Primer
In case you aren't familiar with macros, or haven't written one in a while, let's have a small little primer on what they are and what they look like in the wild.

In the simplest terms, a macro is a rule which specifies how certain pattern of inputs translates into a certain sequence of outputs. It is essentially code which writes code, a technique we refer to as *metaprogramming*.

There are two main types of macros. The first type is extremely basic, it operates at the token level, and is only able to perform basic token substitution and concatenation, without context of what the input is. The second type operates at the AST level, which means that context can be derived from the input, allowing for more powerful substitutions.

There is no standardized term for the two aforementioned types, however, `Rust` calls them `Declarative` and `Procedural` type macros respectively, and that's what we will be referring to them as.
## 3.1 Declarative Macros
If you ever happen to find yourself in the middle of a discourse regarding macros (godforbid), it is most likely that they are discussing about `declarative` macros.

`Declarative` macros are conceptually simple, it's just substitution.

## 3.1.1 Value Macros

In `C`, we can define a macro using the `#define` directive.
```c
// Defining constants.
#define PI 3.14159f
```
Then to use it, we simply have to invoke the macro name in our code and the value will be pasted during compile-time.
```c
float calculate_circle_area(float radius)
{
  // Expands into: return radius * radius * 3.14159f;
  return radius * radius * PI;
}
```
As you can see, macros can be used to help improve readability, instead of using magic numbers we can instead use macros. Of course it’s also fully valid to use a variable but for historical reasons macros were required because there was no such thing as a const qualifier in prior versions of C.

## 3.1.2 Function-like Macros

We can also declare macros which takes in parameters. 

Here is how we can redefine our circle area function as a macro.
```c
#define CALCULATE_CIRCLE_AREA_FROM_RADIUS(radius) (radius * radius * PI)

// `##` is a special operator for concatenating tokens together.
#define GLUE(a, b) a ## b
```
> Note that in C, the call site of the macro may look exactly identical to that of a function. In order to mitigate this issue, we often employ a convention to help us differentiate between the two.

```c
// Expands into: (5.f * 5.f * 3.14159f);
CALCULATE_CIRCLE_AREA_FROM_RADIUS(5.f);

// Expands into: float area1 = (5.f * 5.f * 3.14159f);
float GLUE(area, 1) = CALCULATE_CIRCLE_AREA_FROM_RADIUS(5.f);
```
> Note: This is for demonstration. You should always use a function where applicable and reserve the usage of macros to specific actions which functions can't achieve like `GLUE`.
## 3.1.3 Tricks
Here are some quick tricks, they aren't relevant as a primer, but they *are* cool.
## do-while
In C, we can group statements together in a do-while loop. This helps maintainability, by forcing us to postfix our macro calls with a semi-colon.
```c
#define DO_SMTH do { stmt1(); stmt2(); } while (0)
```
## Pattern Matching
Macro patterns can be matched and invoked after concatenation.
```c
#define GREET_WORLD hello_world()
#define GREET_ME    hello_me()
#define GREET(who)  GREET_ ## who

// Expands into: // hello_world()
GREET(WORLD)
```

## X-Macros
Useful for generating list-like structures.
```c
#define LIST_OF_NAMES(M) \
  M(FOO) \
  M(BAR)

#define ENUMERATE(name) name,

enum class Names
{
  LIST_OF_NAMES(ENUMERATE)
};
```
Expands into:
```cpp
enum class Names 
{
  FOO,
  BAR,
};
```
This is particularly useful for generating different parts of your code which requires the same information.

## 3.2 Procedural Macros
A `procedural macro` allows for creation of new syntax. They are functions which execute during compile time, consuming and generating syntax. They are basically functions which takes in an AST, and generates an AST as output.

This concept is best demonstrated by a language like `Lisp` because of how regular the syntax is (everything is a list).

In `Lisp`, there are three main building blocks:
- **atom**: A number or a string of contiguous characters.
- **string**: A sequence of characters enclosed in double quotation.
- **list**: A sequence of atoms/strings/lists enclosed in parentheses.

The syntax of `Lisp` is simply:
```lisp
(OPERATOR OPERANDS...)
```
So here is how one might write a "hello world" program in Lisp:
```lisp
(write-line "Hello, World!")
```
Here is how one could sum a list of integers:
```lisp
(+ 1 2 3 4)
```
Here is how one could define a function to greet someone:
```lisp
(defun greet (name)
  (format t "Hello ~A!" name))

; Output: "Hello Foo!"
(greet "Foo")
```
As you can see the syntax is very regular. 

> But why is this good for macros?

- Well -- on one hand, we have our `Lisp` code, which is composed purely out of lists. The code is very easy to parse, and it has a very nice property: it reflects the `AST`!
- On the other, we have `Lisp`, which is very good at dealing with lists.

So writing a macro becomes trivial, it is just writing another `Lisp` function and passing `Lisp` code in as input.

I won't go into further detail about Lisp, but [here](https://github.com/fredokun/lisp-list-comprehensions/blob/master/list-comprehensions.lisp.md) is a cool example of how one could implement Python-like `list comprehension` in Lisp.

# 4. Macten: Declarative Macros

The way `Macten` declares macros is heavily influenced by `Rust`'s syntax for `declarative` macros.

In `Rust`, creating and using macros is straightforward. You define a macro with `macro_rules!` and call it by its name followed by an exclamation mark (`!`).
```rs
// Value Macro
macro_rules! PI {
  () => {
    3.14159
  }
}

// Function-like Macro
macro_rules! CALCULATE_CIRCLE_AREA_FROM_RADIUS {
  ($radius: expr) => {
    ($radius * $radius * PI![])
  }
}

// Invocation 
let area = CALCULATE_CIRCLE_AREA_FROM_RADIUS!(5.0);
```
Here is how we can do it in `Macten`: 
```rs
// Value Macro
defmacten_dec PI {
  () => {
    3.14159
  }
}

// Function-like Macro
defmacten_dec CALCULATE_CIRCLE_AREA_FROM_RADIUS {
  ($radius) => {
      ($radius * $radius * PI![])
  }
}

// Invocation (in any language)
area = CALCULATE_CIRCLE_AREA_FROM_RADIUS![(5.0)]
```
As you can see it is almost identical with some minor differences.

## 4.1 Tokens
`Macten` has no preconceptions of what tokens look like. 

For example, it does not know that `5.f` or `5.0` should be grouped together in one token.

Apart from contiguous strings, if you want to ensure that certain lexical values are grouped together in one token, you have to explicitly mark them by wrapping them in parentheses.

For example in the `CALCULATE_CIRCLE_AREA_FROM_RADIUS` call:
```rs
area = CALCULATE_CIRCLE_AREA_FROM_RADIUS![(5.0)]
```
## 4.2 Variadic Arguments
> Important: Variadic arguments can ONLY be placed at the end of a parameter list.

`Declarative macros` allow variadic arguments this is achieved by declaring an input parameter with the following syntax: `$($args)`. The pattern which we want to parse has to be enclosed in parentheses, and the final group will be captured in the `$args` symbol.


Consider the following `min` macro.
```rs
defmacten_dec min {
  ($x $($y)) => {min($x, min![$y])}
  ($x) => {$x}
}

// Expands into: min(1, min(2, 3)) 
min![1 2 3]
```
Here our variadic pattern `$($y)` does not expect any pattern, it captures all the tokens after the first one (which is put into `$x`). The captured values are kept inside `$y` and passed on to be expanded recursively.

The following example might illustrate pattern capturing a little better:
```rs
// Discard the first value and return the rest
defmacten_dec rest {
  ($first $($rest)) => {$rest}
}

// Expands into: second third fourth 
rest![first second third fourth]
```
Now let's introduce some patterns to our variadic input.
```rs
defmacten_dec csv_rest {
  ($first, $($rest,)) => {$rest}
}

// Expands into: second,third,fourth,
csv_rest![first, second, third, fourth,]
```
> The trailing comma is necessary because the pattern has to be complete for a match. 

Notice that the capture body contains the whole pattern, not just the values at the position of `$rest` (second third fourth). This is by design, because unpacking of patterns is expected to be done by the user.

Now we are equipped with enough knowledge to remaster our `min` macro to take comma-seperated values.
```rs
defmacten_dec min {
    ($x, $($y,)) => {min($x, min![$y])}

    // Strip the last trailing comma
    ($x,) => {$x}
}

// Expands into: min(1, min(2, 3))
min![1, 2, 3,]
```
