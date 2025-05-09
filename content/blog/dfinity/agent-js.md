+++
title = "Using JavaScript with the Internet Computer"
date = 2022-05-02
updated = "2024-10-23"
image = "/images/dfinity-logo.jpg"
description = "Getting started with IC Development - How the JavaScript Agent works, my recommended workflows, and how to get set up with various tools and environments"
[taxonomies]
tags = ["dfinity", "javascript", "icp"]
+++

## Basics

To get started with JavaScript on the Internet Computer, I recommend you follow the [quickstart guide](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/) in order to get set up with the basics of your development environment. This includes:

- Dfinity's development SDK, `dfx` (installed using the `dfx` version manager)
- Node JS (18, 20, 22)
- A canister you want to experiment with. I suggest starting with:
  - `dfx new` starter project
  - an example from [dfinity/examples](https://github.com/dfinity/examples)

---

The Internet Computer is accessible via an API available at [https://icp-api.io](https://icp-api.io). Canisters are able to define their own interfaces using the Candid Interface Declaration Language (IDL), and they will respond to calls through the public API. The API is more complex than a typical REST interface, so I recommend using an [agent](https://internetcomputer.org/docs/current/developer-docs/developer-tools/dev-tools-overview/#agents) in your preferred language.

There are two basic types of calls - `queries` and `updates`. Queries are fast and cannot change state. Updates go through consensus, and will take around 2-4 seconds to complete.

As a result of the latency for updates, best practices around modeling your application's performance will have you make updates asynchronously and early. If you can make an update ahead of time and have it already "cached" in your canister's memory, your users will have a better experience requesting that data. Similarly, if your application needs to make an update, it is best to avoid blocking interaction while your update is taking place. Use _optimistic rendering_ wherever practical, and proceed with your application as if the call has already succeeded.

### A simple call

Talking to the IC from your application starts with the canister interface. Let's take a very simple one to begin with.

```
# hello.did
service : {
  greet: (text) -> (text);
}
```

This is a Candid interface. It defines no new special types, and defines a `service` interface with a single method, `greet`. Greet accepts a single argument, of type `text`, and responds with `text`. Unless labeled as a `query`, all calls are treated as updates by default.

In JS, `text` maps to a type of `string`. You can see a full list of Candid types and their JS equivalents at the [Candid Types](https://internetcomputer.org/docs/candid-guide/candid-types.html) reference.

Since this interface is easily typed, we are able to automatically generate a JavaScript interface, as well as TypeScript declarations, for this application. This can be done in two ways. You can manually generate an interface using the `didc` tool, by going to the [releases](https://github.com/dfinity/candid/releases) tab of the dfinity/candid repository.

In most cases, it is easier to configure your project to have a canister defined in `dfx.json`, and to generate your declarations automatically using the `dfx generate` command.

For our Hello World example, that looks like this:

```
// dfx.json
{
  "canisters": {
    "hello": {
      "main": "src/hello/main.mo",
      "type": "motoko"
    },
	...
}
```

Then when we run `dfx generate`, dfx will automatically write the following to your src/declarations directory inside your project.

```
|── src
│   ├── declarations
│   │   ├── hello
│   │   │   ├── hello.did
│   │   │   ├── hello.did.d.ts
│   │   │   ├── hello.did.js
│   │   │   ├── hello.most
│   │   │   └── index.js
```

`hello.did` defines your interface, as we saw above, and `hello.most` is used for upgrade safety. That leaves us with the three remaining files, `index.js`, `hello.did.js`, and `hello.did.d.ts`.

Let's start with the simplest, `hello.did.d.ts`.

This file will look something like this:

```ts
import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";
export interface _SERVICE {
  greet: ActorMethod<[string], string>;
}
```

The `_SERVICE` export includes a `greet` method, with typings for an array of arguments and a return type. This will be typed as an [ActorMethod](https://agent-js.icp.xyz/agent/interfaces/ActorMethod.html), which will be a handler that takes arguments and returns a promise that resolves with the type specified in the declarations.

Next, let's look at `hello.did.js`.

```js
export const idlFactory = ({ IDL }) => {
  return IDL.Service({ greet: IDL.Func([IDL.Text], [IDL.Text], []) });
};
```

Unlike our `did.d.ts` declarations, this `idlFactory` needs to be available during runtime. The `idlFactory` gets loaded by an [Actor](https://agent-js.icp.xyz/agent/interfaces/Actor.html) interface, which is what will handle structuring the network calls according to the IC API and the provided candid spec.

This factory again represents a service with a `greet` method, and the same arguments as before. You may notice, however, that the `IDL.Func` has a third argument, which here is an empty array. That represents any additional annotations the function may be tagged with, which most commonly will be `"query"`.

And third, we have `index.js`, which will pull those pieces together and set up a customized actor with your smart contract's interface. This does a few things, like using `process.env` variables to determine the ID of the canister, based on which deploy context you are using, but the most important aspect is in the `createActor` export.

```js
export const createActor = (canisterId, options) => {
  const agent = new HttpAgent({ ...options?.agentOptions });

  // Fetch root key for certificate validation during development
  if (process.env.NODE_ENV !== "production") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running",
      );
      console.error(err);
    });
  }
  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};
```

This constructor first creates a `HttpAgent`, which wraps the JS `fetch` API and uses it to encode calls through the public API. We also optionally fetch the root key of the replica, for non-mainnet deployments. Finally, we create an Actor using the automatically generated interface for the canister we will call, passing it the `canisterId` and the `HttpAgent` we have initialized.

This `Actor` instance is now set up to call all of the service methods as methods. Once this is all set up, like it is by default in the `dfx new` template, you can simply run `dfx generate` whenever you make changes to your canister API, and the full interface will automatically stay in sync in your frontend code.

## Browser

The browser context is the easiest to account for. The `fetch` API is available, and most apps will have an easy time determining whether they need to talk to `https://icp0.io` or a local replica, depending on their URL.

When you are building apps that run in the browser, here are some things to consider:

### Performance

Updates to the IC may feel slow to your users, at around 2-4 seconds. When you are building your application, take that latency into consideration, and consider following some best practices:

- Avoid blocking UI interactions while you wait for the result of your update. Instead, allow users to continue to make other updates and interactions, and inform your users of success asynchronously.
- Try to avoid making inter-canister calls. If the backend needs to talk to other canisters, the duration can add up quickly.
- Use `Promise.all` to make multiple calls in a batch, instead of making them consecutively
- If you need to fetch assets or data, you can make direct `fetch` calls to the `raw.ic0.app` endpoint for canisters

## Node.js

### Configuration

You may need to do some additional configuration for your node.js application, using the default declarations we provide from dfx generate. This is because there are a couple features that are typically present in the browser context that may not be available in your Node.js context. Fetch is now available in Node 18, so that may not work out of the box. However, in older versions, you may need to configure fetch to be available in the global context, as well as the `TextEncoder` API.

In Node 18 - the setup is fairly simple. You need to make the following changes once you've generated your declarations:

1. Rename the `.js` files to `.mjs`
2. Comment out the last line exporting `hello`
3. Either provide the canisterId through a process variable or import it directly
4. Pass the host during the `createActor` method

```js
// script.mjs
// Note - files were re-named from js to mjs
import { createActor } from "../declarations/hello/index.mjs";

import canisterIds from "../../.dfx/local/canister_ids.json" assert { type: "json" };

const canisterId = canisterIds.hello.local;

const hello = createActor(canisterId, {
  agentOptions: {
    // fetch polyfill would go here if needed
    host: "http://127.0.0.1:8000",
  },
});

hello.greet("Alice").then((result) => {
  console.log(result);
});
```

This will work out of the box, but you may also prefer to use a bundler to support TypeScript or other language features.

## Bundlers

We recommend using a bundler to assemble your code for convenience and less troubleshooting. We provide a standard Webpack config, but you may also turn to Rollup, Vite, Parcel, or others. Dfx will generate a `.env` file with your canister IDs for you automatically if you add a `output_env_file` configuration to `dfx.json`. The IDs will accurately reflect the `network` of your latest command, which makes it easier to manage having different `canister_ids` on your local machine vs production.

Then, you can add `"prestart"` and `"prebuild"` commands of `dfx generate <my-backend-canister>`. Follow documentation for your preferred bundler on how to work with environment variables.
