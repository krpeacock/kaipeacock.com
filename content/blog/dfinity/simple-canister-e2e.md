+++
title = "Testing Your Canister With Vitest"
date = 2022-07-08
image = "/images/dfinity-logo.jpg"
description = "An intro into end-to-end testing Internet Computer canisters in JavaScript/TypeScript using Vitest"
[taxonomies]
tags = ["dfinity", "testing", "web development"]
+++

Have you gotten started building on the Internet Computer and are interested in writing some automated tests for your code? This is a quick guide on how to get started, using the Hello World starter app.

An example project with all the code used here is available at [https://github.com/krpeacock/sample-canister-e2e](https://github.com/krpeacock/sample-canister-e2e).

## Setting Up

First, start with a `dfx new hello` project. Remove the `hello_assets` folder and then remove the canister config in dfx.json. Once you've cleaned up the boilerplate, your config should look like this:

```json
// dfx.json
{
  "canisters": {
    "hello": {
      "main": "src/hello/main.mo",
      "type": "motoko"
    }
  },
  "version": 1
}
```

Next, install `vitest` and `isomorphic-fetch`. Note: You can use Jest instead, but you'll need to do a little more setup.

```bash
npm install --save-dev vitest isomorphic-fetch
```

Add `"test": "vitest"` to your `package.json` scripts.

### Actor setup

Create a folder for your tests. I place mine in `<project-root>/src/e2e`. Inside of `e2e`, create a
utility to create your agent using the generated declarations, named `actor.js`. Note: I'm mixing use of JS and TS files here because there are a couple annoying TS warnings with these imports that aren't worth fixing.

```js
// actor.js
import { Actor, HttpAgent } from "@dfinity/agent";
import fetch from "isomorphic-fetch";
import canisterIds from ".dfx/local/canister_ids.json";
import { idlFactory } from "../declarations/hello/hello.did.js";

export const createActor = async (canisterId, options) => {
  const agent = new HttpAgent({ ...options?.agentOptions });
  await agent.fetchRootKey();

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};

export const helloCanister = canisterIds.hello.local;

export const hello = await createActor(helloCanister, {
  agentOptions: { host: "http://127.0.0.1:8000", fetch },
});
```

> Since we are testing locally, we always will fetch the root key.

This setup file handles reading canister IDs from their JSON, importing IDL from the declarations, creating a default actor and configuring it with a fetch polyfill (not necessary in Node 16+) and local host.

## Writing tests

Now, create a file for your tests. `hello.test.ts`. First, we'll set up the basics, importing our testing methods, `agent-js` imports, and our actor utilities.

```ts
// hello.test.ts
import { expect, test } from "vitest";
import { Actor, CanisterStatus, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { helloCanister, hello } from "./actor";
```

### Calling Hello World

Finally, we can test our canister! This method is fundamentally pretty simple, but let's go through the exercise anyway. The `test` method accepts two arguments - a test name, and a function. Inside of the test, we'll run through some steps, and then use the `expect` util to check results against expected results. See [vitest docs](https://vitest.dev/) for more info.

```ts
test("should handle a basic greeting", async () => {
  const result1 = await hello.greet("test");
  expect(result1).toBe("Hello, test!");
});
```

Spin up your canister, and then you can run `npm test` (or [bun](https://bun.sh/) test!) to run your new test.

```bash
dfx start --background --clean
dfx deploy
dfx generate
npm test
```

You should see a success message like this in your terminal, while `vitest` waits for new changes to your source code.

```bash
 ✓ src/e2e/hello.test.ts (1)

Test Files  1 passed (1)
     Tests  1 passed (1)
      Time  13ms


 PASS  Waiting for file changes...
       press h to show help, press q to quit
```

### Testing CanisterStatus

For a slightly more complex test as reference, let's add a test for canister metadata using the new CanisterStatus API.

```ts
test("Should contain a candid interface", async () => {
  const agent = Actor.agentOf(hello) as HttpAgent;
  const id = Principal.from(helloCanister);

  const canisterStatus = await CanisterStatus.request({
    canisterId: id,
    agent,
    paths: ["time", "controllers", "candid"],
  });

  expect(canisterStatus.get("time")).toBeTruthy();
  expect(Array.isArray(canisterStatus.get("controllers"))).toBeTruthy();
  expect(canisterStatus.get("candid")).toMatchInlineSnapshot(`
    "service : {
      greet: (text) -> (text) query;
    }
    "
  `);
});
```

## Repeatable identities

It is often useful to use an identity that will remain consistent across runs of your e2e tests. Here is a script using `bip39` and the industry standard "12 peacocks" test phrase.

```ts
//identity.ts
import { Secp256k1KeyIdentity } from "@dfinity/identity";
import hdkey from "hdkey";
import bip39 from "bip39";

// Completely insecure seed phrase. Do not use for any purpose other than testing.
// Resolves to "wnkwv-wdqb5-7wlzr-azfpw-5e5n5-dyxrf-uug7x-qxb55-mkmpa-5jqik-tqe"
const seed =
  "peacock peacock peacock peacock peacock peacock peacock peacock peacock peacock peacock peacock";

export const identityFromSeed = async (phrase) => {
  const seed = await bip39.mnemonicToSeed(phrase);
  const root = hdkey.fromMasterSeed(seed);
  const addrnode = root.derive("m/44'/223'/0'/0/0");

  return Secp256k1KeyIdentity.fromSecretKey(addrnode.privateKey);
};

export const identity = identityFromSeed(seed);
```

This script will reproduce an identical Principal to the same seed phrase imported through [Quill](https://github.com/dfinity/quill) into DFX.

You can verify the reproducibility by adding a test for it - identity.test.ts

```ts
// identity.test.ts
import { expect, test } from "vitest";
import { identity } from "./identity";

test("the identity should be the same", async () => {
  const principal = (await identity).getPrincipal();
  expect(principal.toString()).toMatchInlineSnapshot(
    '"wnkwv-wdqb5-7wlzr-azfpw-5e5n5-dyxrf-uug7x-qxb55-mkmpa-5jqik-tqe"',
  );
});
```

## Finally, Continuous Integration

This part is boring and I don't want to explain how to configure Github in depth. If you want to add checks to your PR's, do the following.

1. add a CI script to your `package.json` scripts.

We'll do this with

```json
"ci": "vitest run",
"preci": "dfx stop; dfx start --background --clean; dfx deploy; dfx generate"
```

This way, it automatically sets up dfx and runs the tests a single time, reporting the results.

2. Add a GitHub workflow config.

Specifically, this one. Create a `.github` folder and inside it, create a `workflows` folder. Add `e2e.yml` with these contents:

```yml
name: End to End

on:
  pull_request:
    types:
      - opened
      - reopened
      - edited
      - synchronize

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-20.04]
        ghc: ["8.8.4"]
        spec:
          - "0.16.1"
        node:
          - 16

    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node }}
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node }}

      - run: npm install

      - run: echo y | sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

      - run: npm run ci
        env:
          CI: true
          REPLICA_PORT: 8000
```

And there you go! You should now have automated end to end tests running on your canister for every pull request.
