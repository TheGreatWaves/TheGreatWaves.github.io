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
This project aims to develop a generic macro preprocessor that combines the established functionalities of token substitution and gluing (offered by tools like [GNU M4](https://www.gnu.org/software/m4/) and [GPP](https://github.com/logological/gpp?tab=readme-ov-file)) with the capabilities of procedural macros.

