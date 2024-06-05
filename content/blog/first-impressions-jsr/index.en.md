+++
title = "Publishing to JSR for the first time"
description = "I recently decided to publish a package to JSR for the first time. A number of changes were needed to make my code compatible, but all in all, it was a good experience."
date = 2024-06-01T14:53:20+02:00
lastmod = 2024-06-01T14:53:20+02:00
publishdate = 2024-06-01T14:53:20+02:00
tags = ["web"]
categories = ["development"]
newsletter_groups = ["Web dev"]
draft = false
+++

I recently decided to publish an [open-source library](https://github.com/samjmck/tobcalc) I created to the [JavaScript Registry (JSR)](https://jsr.io), a new package registry that seems to be an alternative to npm. JSR is created by the same people behind Deno, the runtime I chose while developing the library.

It used to be the case that no matter what no matter what JavaScript runtime you were writing your library for, you really only had one registry to distribute it with: npm.  This kinda sucks, because 1) maybe your library is not aimed for Node users, but now you're publishing it on the _Node_ package manager and 2) the runtime you were using would have to support npm. This is the problem that JSR seems to be trying to solve: it's a registry designed to be used by any runtime. 

But before I talk about what it was like to publish my library on JSR, let's talk about how importing modules in Deno has evolved. You used to only be able to import third-party packages through something called "remote imports". Basically, you could host your module on any HTTP server, and you would import the module using the URL of module's entrypoint. Most people used either GitHub or [`deno.land/x`](https://deno.land/x) to host their modules. It was pretty annoying to have to import everything through a URL. Deno themselves recommended importing everything through one file and re-exporting everything. At that point, you're effectively recreating a `package.json` file in JavaScript. But then, Deno introduced Node and npm compatibility, allowing developers to use packages from npm using the `npm:` specifier. 

And fast-forward to today, you can now add JSR to the mix. The Deno team seems to have changed their stance on remote imports as it is not possible to publish a package to JSR if it uses them. And while remote imports are still supported in Deno, probably for backwards compatibility, it seems like they are trying to move away from them. So to summarise, moving forward, Deno is pushing developers to use JSR to publish and import packages and trying to move away from remote imports.

## Updating the library so I could publish it

Not allowing remote imports was probably the biggest pain-point when updating my library so I could publish it to JSR. All remote imports had to be changed to either imports from JSR, or from npm. And since at the time of updating the library not many packages were on JSR, I had to use npm. So, this:

```ts
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib@1.17.1?dts";
```

Changed to this:

```ts
import { PDFDocument } from "npm:pdf-lib@1.17.1"
```

Which in the final implementation, changed to using an import map in `deno.json` to ensure I don't have to mess around with copying the specific identifiers with the version number across the codebase:

```js
// deno.json
{
    "imports": {
        "@std/cli": "jsr:@std/cli@0.220.1",
        "@std/assert": "jsr:@std/assert@0.220.1",
        "@std/flags": "jsr:@std/flags@0.220.1",
        "pdf-lib": "npm:pdf-lib@1.17.1",
        "fontkit": "npm:fontkit@2.0.2"
    }
}
```

Another annoyance was having to explicitly give types to any exported functions, classes or variables. Apparently, ["slow types"](https://jsr.io/docs/about-slow-types) occur when a type is not explicitly given and is complex to infer. To infer these types, it would be necessary to run the TypeScript compiler on the full codebase, which is not something JSR wants to do. So, I went through the exported items and added types to them. I have since learned you can opt out of this, but that it is enforced by default.

Lastly, I had to create a `jsr.json` file or `deno.json` file containing the package name, description and so on. The guide on [JSR.io](https://jsr.io/docs/publishing-packages) shows you exactly how to setup a GitHub Action so the package gets published any time I push to GitHub.

Those were the changes I had to make for the library to be published on JSR. To be honest, they weren't too bad, and writing a library for JSR with these things in mind from the start would be even easier. 

## Final thoughts

After publishing your library to JSR, it is given a [JSR Score](https://jsr.io/@samjmck/tobcalc-lib/score) which ranks your package based on a number of factors, such as whether it has a `README`, how many runtimes it supports, and so on. I think these are good metrics to have, and that they encourage developers to make higher quality packages. 

Without playing with any configs for transpilers or module bundlers, I was able to publish a library that works in Deno, Node and other runtimes. This is largely thanks to the [npm compatibility layer](https://jsr.io/docs/npm-compatibilit) which basically transpiles your TypeScript code to JavaScript and generates type definitions alongside it. To me, this first class support for TypeScript and built-in transpiling is what makes JSR so appealing. The more tools that can be removed from the development process and the less configuration that is needed, the better.

