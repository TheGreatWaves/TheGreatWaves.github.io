+++
title = 'Macten'
date = 2024-05-23T14:46:26+07:00
draft = false
summary = "A powerful macro processor with declarative and procedural options, using clear modern syntax."
terms = ['C++', 'Python', 'Macro', 'Transpiler']
tags = ['favorited']
+++

# Introduction
I was first exposed to macros in the form of the `#define` directive which can be found in the `C` programming language. Initially, I was puzzled as to why such a feature would be useful, however as time passed and as I gain more experience, I began to appreciate it more and more. (despite its very apparent flaws and limitations)

I was frustrated to find out that other languages like `Java` and `Python` lacked any macro features (though, of course, they have constructs which replicate macro behavior). I am fully aware that languages like `C` needed macros, but the same cannot be said for other languages.

For a while my idea of a macro was limited to simply token substitution and token gluing. However, after learning `Rust` and experiencing its `procedural` macros, I learnt that macros could do so much more.

# Objective
The aim of this project is to develop a generic macro preprocessor that combines the established functionalities of token substitution and gluing (offered by tools like [GNU M4](https://www.gnu.org/software/m4/) and [GPP](https://github.com/logological/gpp?tab=readme-ov-file)) with the capabilities of procedural macros.
# Primer
In case you aren't familiar with macros, or haven't written one in a while, let's have a small little primer on what they are and what they look like in the wild.

In the simplest terms, a macro is a rule which specifies how certain pattern of inputs translates into a certain sequence of outputs. It is essentially code which writes code, a technique we refer to as *metaprogramming*.

There are two main types of macros. The first type is extremely basic, it operates at the token level, and is only able to perform basic token substitution and concatenation, without context of what the input is. The second type operates at the AST level, which means that context can be derived from the input, allowing for more powerful substitutions.

There is no standardized term for the two aforementioned types, however, `Rust` calls them `Declarative` and `Procedural` type macros respectively, and that's what we will be referring to them as.
# Declarative Macros
If you ever happen to find yourself in the middle of a discourse regarding macros (godforbid), it is most likely that they are discussing about `declarative` macros.

`Declarative` macros are extremely simple, consider the following example in everyone's favorite language.

In `C`, we can define a macro using the `#define` directive.
```c
// Defining constants.
#define PI 3.14159f
```
Then to use it, we simply have to invoke the macro name in our code.
```c
float calculate_circle_area(float radius)
{
  // Expands into: return radius * radius * 3.14159f;
  return radius * radius * PI;
}
```
As you can see, macros can be used to help improve readability, instead of using magic numbers we can instead use macros. Of course it’s also fully valid to use a variable but for historical reasons macros were required because there was no such thing as a const qualifier in prior versions of C.

# Function-like Macros

We can also declare macros which takes in parameters. 

We can redefine our circle area function as a macro.
```c
#define CALCULATE_CIRCLE_AREA_FROM_RADIUS(radius) (radius * radius * PI)
```
> Note is that the call site of the macro may look exactly identical to that of a function (atleast in C). In order to mitigate this issue, we often employ a convention to help us differentiate between the two.

```c
// Expands into: (5.f * 5.f * 3.14159f);
CALCULATE_CIRCLE_AREA_FROM_RADIUS(5.f);
```



