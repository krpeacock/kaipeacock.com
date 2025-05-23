+++
title = "Dfx 0.7.7 Changes"
date = 2021-07-20
image = "/images/dfinity-logo.jpg"
description = "Explaining the changes coming to frontend development in dfx 0.7.7"
[taxonomies]
tags = ["dfinity", "dfx", "frontend", "typescript"]
+++

## Overview

The SDK team has an upcoming release candidate for `dfx` that you can install today by running

```
DFX_VERSION=0.7.7 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

`dfx 0.7.7` will be our first promoted candidate in a while. There are some small bug fixes and updates to Motoko and Candid, but I want to explain some frontend changes that will be coming. I know that I'll be causing some trouble, and that I won't get it right the first time around, but I think these changes will help make developing for the IC simpler for most people, and it takes us in the direction of making more things "just work".

The big ticket items are -

- automatic TypeScript support and tab completion for your actors
- Nicely configured Webpack dev server in `dfx new`
- Resolving the `fetchRootKey` bug.

This will be the most disruptive set of changes to frontend development, but I hope that this writeup helps make sense of the decisions I've made, and makes the upgrade mild.

## Type Inference Update

This is the main change I want to address. Starting with `dfx` `0.7.7`, `dfx` will now provide you with generated declaration files that automatically provide you with correct typing based on your app's candid service. In your JavaScript or Typescript application, you will simply be able to run

```js
import { hello } from "../declarations/hello";
```

and your IDE (tested in VSCode and JetBrains) will know your full service, with tab completion and the ability to infer return types from calls to your API.

![Type Inference Example](/type-inference.png)

Example of IntelliSense for an asset canister's service methods

These methods will allow frontend developers to interact nicely with the interface, and even know all the detail of what their return types will look like while working in the code. It's even more powerful in TypeScript applications!

To make this possible, there are some changes to the codegen that we will create for you.

<h3 id="change-to-index-file">Change to index file</h3>

Previously, under `.dfx/local/canisters/<canister-name>`, we would output a `<canister-name>.js` file. Going forward, to avoid duplicating the directory name, this file will be renamed to `index.js`.

Here's what that file will look like now, for a `hello` project.

```js
// src/declarations/hello/index.js
import { Actor, HttpAgent } from "@dfinity/agent";

// Imports candid interface
import { idlFactory } from "./hello.did.js";
// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = process.env.HELLO_CANISTER_ID;

/**
 *
 * @param {string | Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig}} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("./hello.did.js")._SERVICE>}
 */
export const createActor = (canisterId, options) => {
  const agent = new HttpAgent({ ...options?.agentOptions });

  // Fetch root key for certificate validation during development
  if (process.env.NODE_ENV !== "production") agent.fetchRootKey();

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};

/**
 * A ready-to-use agent for the hello canister
 * @type {import("@dfinity/agent").ActorSubclass<import("./hello.did.js")._SERVICE>}
 */
export const hello = createActor(canisterId);
```

Previously, we exported the IDL, a hardcoded `canisterId`, and then had you assemble the actor yourself. Now, we are setting you up with a `createActor` export and a `hello` export. The `createActor` function accepts a `canisterId` and `options`, and automatically sets you up with the `idlFactory` from `./hello.did.js`.

If you have used recent versions of `@dfinity/agent`, you probably also noticed that we have added logic to fix the common `fetchRootKey` error that has been in place since Genesis. The `createActor` function will call `agent.fetchRootKey` for you during local development, but will not call it in production. This gives you the ease of not thinking about the root certificate, with the security benefits of your code only trusting a valid subnet that signs calls with the root key of the NNS, hardcoded into `@dfinity/agent`.

The return type of createActor is an `ActorSubclass`, linked with the `_SERVICE` interface from the adjacent `.d.ts` file. This is accomplished using JSDoc comments. Finally, at the bottom, we export a `hello` actor, which sets you up with an already created actor for situations where you don't need to configure a specific `identity`, `host`, or other options to the `HttpAgent`.

Speaking of the `.d.ts` file..

### TypeScript Declaration Changes

1. The `<canister-name>.d.ts` file has been renamed to `<canister-name>.did.d.ts`.

This change was suggested on [our forum](https://forum.dfinity.org/t/bug-report-dfx-auto-gen-canister-d-ts-wrong-naming/4468). The types are in reference to the IDL interface from `.did.js`, so it's correct for the type declaration file to reflect its peer instead of the index.js

Additionally, we have updated `dfx` to the latest versions of Candid and Motoko. The main thing to mention here is that the output of `<canister-name>.did.d.ts` may have changed slightly, and that the service is no longer a default export.

## Changes to dfx new

To accommodate these changes, we have made some changes to the `dfx new` project. Most of the changes are to `webpack.config.js` and to `package.json`, but I'll go through them one-by-one.

### Copying the declarations

This is a pattern that I personally now recommend - committing your codegen files to your source code. It's how we operated for the Cycles Wallet, Internet Identity, and other internal projects on an ad-hoc basis, and it turned out to be the only reliable way to support type inferenece without fragile path references in `tsconfig.json`.

In the new `package.json`, we provide you with a `"copy:types"` script that looks like this:

```json
"copy:types": "rsync -avr .dfx/$(echo ${DFX_NETWORK:-'**'})/canisters/** --exclude='assets/' --exclude='idl/' --exclude='*.wasm' --delete src/declarations"
```

This script copies the contents of your canisters in `.dfx/local/canisters` and copies them to their own directories in `src/declarations`, ignoring the `wasm` module.

From that point on, you'll be able to import directly from `src/declarations/<canister-name>`, and your editor will be able to behave normally, without needing bundler aliases or unusual typescript configuration.

The `dfx new` project also has logic to sync the types whenever you run `npm run build` or `npm start`. This is the easiest workflow if you are doing fullstack work for now - build your file and the next time you start the frontend server, you'll get the new interfaces.

> Note: more details about syncing in the [migrating section](#migrating-your-project)

### Webpack dev server

At last, give you a pleasantly-configured dev server set up out of the box. `npm start` will start the server directly at `http://localhost:8080`, and you can simply open it, without needing to enter a `canisterId` query parameter at `localhost:8000`.

Changes to your `assets` directory or `src` in the `<canister-name>_assets` directory will kick off hot-reload updates to the browser. API calls to will be proxied to `localhost:8000`, so you can interact with the local replica seamlessly.

<h2 id="migrating-your-project">Migrating your project</h2>

If you have an existing project, you may need to make some adjustments when upgrading to 0.7.7+.

As I've mentioned, we are moving toward a pattern of development where the generated files no longer live in `.dfx` but instead will live as source code.

### Environment variables

With webpack, we are providing those environment variables by using an EnvironmentPlugin. At the top of `webpack.config.js`, we read from the root `canister_ids.json` and the one inside `.dfx/local` to map the canister IDs into environment variables, and then replace the `process.env` values in the code during development or at build time.

```js
// webpack.config.js
let localCanisters, prodCanisters, canisters;

try {
  localCanisters = require(path.resolve(".dfx", "local", "canister_ids.json"));
} catch (error) {
  console.log("No local canister_ids.json found. Continuing production");
}

function initCanisterIds() {
  try {
    prodCanisters = require(path.resolve("canister_ids.json"));
  } catch (error) {
    console.log("No production canister_ids.json found. Continuing with local");
  }

  const network =
    process.env.DFX_NETWORK ||
    (process.env.NODE_ENV === "production" ? "ic" : "local");

  canisters = network === "local" ? localCanisters : prodCanisters;

  for (const canister in canisters) {
    process.env[canister.toUpperCase() + "_CANISTER_ID"] =
      canisters[canister][network];
  }
}
initCanisterIds();
```

If it is difficult or not worthwhile for you to use the webpack config that we provide in the `dfx new` project, here are some things to consider:

1. Identifying canister ids. The output no longer hardcodes the canister ids into JavaScript, so you will need to provide that code using your own strategy. Other bundlers that allow for custom scripting should be able to re-use the webpack config logic.
2. Determining `NODE_ENV`. During development, the app should call `agent.fetchRootKey()`, but it should not fetch the root key in production. See [Change to the index file](#change-to-index-file).
3. Copying the codegen is optional. You still have access to the `.did.js` and `.did.d.ts` files in `.dfx`, so you can choose to ignore the new `index.js` format if it is inconvenient, and continue providing your own Actor.createActor pattern as before.
4. Return types - if you do not want to use the dfx-provided files, consider using the JSDoc comments that we have come up with. If the code knows that your actor has a type of `ActorSubclass<_SERVICE>`, for your particular service, the development process is significantly enhanced in compatible editors.

### Minimal Update

Finally, if you are looking to minimally modify your project, here is all you need to do, assuming you are starting from the 0.7.2 starter:

You can continue using a query parameter in your URL, you can access it via

```js
// src/example_assets/src/index.js
import { idlFactory as example_idl } from "dfx-generated/example/example.did.js";
import canisterIds from "../../../.dfx/local/canister_ids.json";

const example_id =
  new URLSearchParams(window.location.search).get("exampleId") ||
  canisterIds.example.local;

const agent = new HttpAgent();
agent.fetchRootKey();
const example = Actor.createActor(example_idl, {
  agent,
  canisterId: example_id,
});
```

And you can modify the `aliases` reducer to point to the path, rather than hardcoding the old `<canister-name>.js` file

```js
// webpack.config.js

// Old
["dfx-generated/" + name]: path.join(outputRoot, name + ".js"),
// New
["dfx-generated/" + name]: path.join(outputRoot),
```

Then, you can simply `dfx deploy` like normal and visit your working site with [http://localhost:8000/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai&exampleId=rrkah-fqaaa-aaaaa-aaaaq-cai](http://localhost:8000/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai&exampleId=rrkah-fqaaa-aaaaa-aaaaq-cai).

Hope this all helps, and feel free to reach out at [https://forum.dfinity.org/](https://forum.dfinity.org/) or to email me at <a href="mailto:kyle.peacock@dfinity.org">kyle.peacock@dfinity.org</a> if you have further questions.
