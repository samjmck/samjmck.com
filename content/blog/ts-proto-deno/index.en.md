+++
title = "How to use ts-proto or Protocol Buffers with Deno"
description = "There are a few problems with using ts-proto with Deno. In this post, I will show you how to configure ts-proto and Deno so that they work together."
date = 2023-09-21T23:32:13+02:00
lastmod = 2023-09-21T23:32:13+02:00
publishdate = 2023-09-21T23:32:13+02:00
tags = ["web", "development", "deno", "protocol buffers"]
categories = ["development"]
newsletter_groups = ["Web dev"]
draft = false
+++

One of the most popular tools for using Protocol Buffers with TypeScript is [ts-proto](https://github.com/stephenh/ts-proto), which is a code generator that takes a `.proto` file as input and outputs TypeScript code. A problem for Deno users is that the generated code makes use of npm packages, meaning it can require some work before it can be used with Deno. In this post, I will show you how to configure ts-proto and Deno so that they work together.

{{< tableofcontents >}}
<ol>
   <li><a href="#demo-setup">Demo setup</a></li>
   <li><a href="#problems-and-solutions-for-ts-proto">Problems and solutions for ts-proto</a></li>
   <li><a href="#problems-and-solutions-for-deno">Problems and solutions for Deno</a></li>
   <li><a href="#summary">Summary</a></li>
</ol>
{{< /tableofcontents >}}

## Demo setup

For the sake of this post, suppose we have the following `.proto` files:

`money.proto`:
```protobuf
syntax = "proto3";

package demo;

message Money {
    string currency = 1;
    int64 amount = 2;
}
```

`demo.proto`:
```proto
syntax = "proto3";

package demo;

import "money.proto";
import "google/protobuf/timestamp.proto";

message Transaction {
  google.protobuf.Timestamp time = 1;
  Money value = 2;
}
```

In the same directory, we are going to install `ts-proto` with npm by running `npm install ts-proto`. We can then generate the code with the following command assuming `protoc` is installed:

```bash
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=. ./demo.proto
```

## Problems and solutions for ts-proto

There are 3 problems with the generated code that can be fixed by adding flags to the `protoc` command:
1. It gets put in the same directory as the `.proto` files. This isn't a Deno specific issue, but it is something we will fix nonetheless.
2. It uses `require` statements, which are not supported by Deno. We will fix this by using `import` statements instead.
3. It has no file extensions in the import statements, which is required by Deno. We will fix this by adding `.ts` to the import statements.

The problems are fixed by adding the following flags to the `protoc` command:
1. `--ts_proto_out=out` specifies the output directory for the generated code. For this to work, create a `out` directory in the same directory as the `.proto` files.
2. `--ts_proto_opt=esModuleInterop=true` stops old style `require` statements from being generated and instead uses `import` statements which are supported by Deno.
3. `--ts_proto_opt=importSuffix=.ts` will ensure the generated code includes file extensions with the `.ts` suffix.

Now, the full command looks as follows:

```bash
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=out --ts_proto_opt=esModuleInterop=true --ts_proto_opt=importSuffix=.ts ./demo.proto
```

## Problems and solutions for Deno

The generated code uses npm packages. Luckily, Deno can run these packages. To make the code run without any changes, we can use import maps. Add the following to your `deno.json`

```json
{
  "imports": {
    "long": "npm:long",
    "protobufjs/minimal.ts": "npm:protobufjs/minimal.js"
  }
}
```

The last entry of the import map is necessary because `protobufjs/minimal.ts` doesn't actually exist as the `protobufjs` has JavaScript files, not TypeScript files. This is why we need to replace the `.ts` extension with `.js` in the generated code.

## Summary

You can find a demo GitHub repository with everything I just mentioned [here](https://github.com/samjmck/ts-proto-deno/tree/master).

Run the following with `ts-proto` installed to generate the code:

```bash
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=out --ts_proto_opt=esModuleInterop=true --ts_proto_opt=importSuffix=.ts ./demo.proto
```

Add the following `deno.json`:

```json
{
  "imports": {
    "long": "npm:long",
    "protobufjs/minimal.ts": "npm:protobufjs/minimal.js"
  }
}
```