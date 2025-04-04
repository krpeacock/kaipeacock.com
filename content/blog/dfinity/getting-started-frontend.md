+++
title = "Frontend Development on the Internet Computer"
date = 2021-01-16
updated = "2024-10-23"
image = "/images/dfinity-logo.jpg"
description = "Curious about how frontend code works on the Internet Computer? Here's what I've learned after two weeks on the job"
[taxonomies]
tags = ["dfinity", "frontend", "web development"]
+++

{% alert(note=true) %}
This was one of the first blog posts I wrote about the Internet Computer. A lot has changed! I'm keeping this up for preservation purposes, but it's not the best reference if you're learning anymore.

Check out [Using JavaScript with the Internet Computer](./agent-js) or the official [internetcomputer.org](https://internetcomputer.org) website instead
{% end %}

Curious about how frontend code works on the Internet Computer? Here's what I've learned after two weeks on the job.

## What you get in the starter

If you're following the [Quick Start guide](https://internetcomputer.org/docs/quickstart/quickstart-intro.html), you'll get some useful instructions on how to install the `dfx` sdk, leading you to create a templated project using `dfx new hello`.

![How your project looks immediately after init](/dfx_hello_fresh.png)
How your project looks immediately after init

Things will largely look familiar to you if you've been working with frontend code for a while. You've got `src` and `node_modules` folders, as well as `package.json` and `webpack.config.js` config files.

There is also a `dfx.json` config file, which is worth opening up and inspecting.

```json
// dfx.json
{
  "canisters": {
    "hello": {
      "main": "src/hello/main.mo",
      "type": "motoko"
    },
    "hello_assets": {
      "dependencies": ["hello"],
      "frontend": {
        "entrypoint": "src/hello_assets/public/index.js"
      },
      "source": ["src/hello_assets/assets", "dist/hello_assets/"],
      "type": "assets"
    }
  },
  "defaults": {
    "build": {
      "packtool": ""
    }
  },
  "dfx": "0.6.17",
  "networks": {
    "ic": {
      "providers": ["https://gw.dfinity.network"],
      "type": "persistent"
    },
    "local": {
      "bind": "127.0.0.1:8000",
      "type": "ephemeral"
    }
  },
  "version": 1
}
```

Inside, you'll see that the template has provided you with two "canisters": `hello` and `hello_assets`. Their names are generated to match the name of your new project you provided during `dfx new`.

Those canisters point to two directories under your `src` folder. One has some motoko code, and the other is JavaScript. If you're a person, the motoko code is probably new to you, but even the JavaScript has something that looks a little odd to you.

```js
// src/hello_assets/public/index.js
import hello from "ic:canisters/hello";

hello.greet(window.prompt("Enter your name:")).then((greeting) => {
  window.alert(greeting);
});
```

The `hello` object imported from `ic:canisters/hello` is clearly nonstandard, but we'll get to what it's doing in a second.

## Build your starter

To get your starter running, you'll need to run a few commands. First, run `dfx start` and then open a new terminal tab or window.

In the new window, you need to create your on a local version of the internet computer, then compile your code.

```bash
dfx canister create hello
dfx canister create hello_assets
dfx build
```

Now, you should see that you have a `.dfx` directory, with a bunch of new content inside. The interesting bits will be the files inside of `.dfx/local/canisters`, inside the `hello` and `hello_assets` directories.

![new dfx folder](/hello_compiled.png)
new dfx folder

You'll see that the canisters compile into `wasm` code, which is what runs on the canisters, as well as a candid type delcaration file `hello.did`, and JavaScript files that set up an interface for your API.

This code is what enables the `ic:canisters/hello` import that we saw earlier in our source code.

If you look into the `webpack.config.js`, you'll see that there is a pre-filled configuration that uses Webpack's alias feature to link your `ic:canisters/hello` to `.dfx/local/canisters/hello/hello.js`, along with its type declaration file `hello.did.js`.

If you're looking closely at `hello.js`, however, you'll notice something that's not immediately clear. It attaches its interface to a global object, `ic.agent`. You can run a search on your codebase, but you'll see that there's nowhere that sets up this global `ic` object that you can access.

Still, you can navigate to your browser, pull up `localhost:8000` and pass your canister id as a query parameter, and you'll get an html payload that loads and executes your code. The reason that the code works is that the asset canister has a few assumptions and some magic it's doing for you.

- An asset canister bootstraps your identity with html that initializes a global `ic` object and an anonymous identity.
- That anonymous identity allows you to request static assets, including your JS bundle.

From there, you have a workflow that will allow you to run a compile job and deploy a JavaScript application to the Internet Computer. You can work with any JavaScript technology that compiles with WebPack, and build your application.

## Wait, I have to manually build and deploy every time? That sounds slow and bad.

Yeah, I agree with you on that one, and I think we can make some big improvements. In my next post, I'll get into how you can use the `@dfinity/agent` package and a polyfill to create your own global `ic` object to start working with `webpack-dev-server` and enable a more modern workflow. We're actively working on making this process friendlier internally, but if you're eager to get started, you can check out our unofficial Create React App [DFX Template](https://github.com/taylorham/cra-template-dfx) work in progress. Credit to [Mio Quispe](https://github.com/MioQuispe) for their work on the proof of concept and starting point for our project.
