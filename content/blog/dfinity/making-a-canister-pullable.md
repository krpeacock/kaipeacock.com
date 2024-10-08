+++
title = "Make your Canister Pullable"
date = 2023-08-09
image = "/images/dfinity-logo.jpg"
description = "How to enable dfx pull for your canister and thrill your users with a seamless development experience"
[taxonomies]
tags = ["dfinity", "dfx", "canisters"]
+++

How to enable dfx pull for your canister and thrill your users with a seamless development experience. If you are looking for how to use dfx pull, check out the [DFX Pull Example](./use-dfx-pull).

# Resources

- [DFX Pull Docs](https://internetcomputer.org/docs/current/developer-docs/setup/pulling-canister-dependencies/)
- [DFX Pull Example](./use-dfx-pull)

# Disclaimer

There's probably a really clever way to automate all of this with Github releases, but I got bored while trying to prove it out. For this example, gone as far as setting up the build job for my auth client demo repo and publishing the wasm + candid, but ideally it would also handle the `sha256` and `dfx.json` updates as well.

# The Easy way

First, you need to publish your wasm somewhere. You can create a release on Github and drag your wasm out of `.dfx/local` for it, or you can use a CI/CD pipeline to publish it to a registry. I'm using Github Actions to publish my wasm to the Github registry. I'm using this script - https://github.com/krpeacock/auth-client-demo/blob/main/.github/workflows/release.yml. If I push a tag with a `v` prefix, it will publish the wasm to the Github registry and tag the release as latest.

If you are using this approach, and `dfx`, you can update `dfx.json` in your project to make the canister pullable. An example might look like this:

```json
"whoami": {
    "main": "src/whoami/main.mo",
    "type": "motoko",
    "pullable": {
        "dependencies": [],
        "wasm_url": "https://github.com/krpeacock/auth-client-demo/releases/latest/download/whoami.wasm",
        "init_guide": "null"
    }
},
```

Since the canister doesn't require any dependencies, we can leave that array empty. The `wasm_url` is the url to the wasm file in the Github registry. The `init_guide` is a guide for how to initialize the canister. Since this canister doesn't require any initialization, we can set it to `null`.

DFX already adds the candid metadata for you automatically, so with the `pullable` configuration in place, you can now `dfx pull` this canister from the IC and use it in a local project.

## Managing Dependencies

This gets a little trickier, but is basically the same. Make sure that every dependency you want to pull is also pullable. If you do not control all the canisters in that dependency chain, you may need to create custom wasm releases with the appropriate metadata to make this possible.

# The Hard Way

If you don't want to use `dfx`, you can still make your canister pullable. I know you sickos are out there, so let's get into it.

## Firm Requirements

Your wasm must have `icp:public candid:service` and `icp:public dfx` custom sections. The `icp:public candid:service` section is the contents of your `.did` file. The `icp:public dfx` section is a json object with the following shape:

```json
{
  "pullable": {
    "wasm_url": "https://github.com/krpeacock/auth-client-demo/releases/latest/download/whoami.wasm",
    "wasm_hash": null,
    "dependencies": [],
    "init_guide": "null"
  }
}
```

Of these, the `wasm_hash` is optional. Everything else must be provided.

## How to insert the custom sections

I'm told you can do this in Rust somehow. I don't know how to do that, so I'm going to recommend using [ic-wasm](https://github.com/dfinity/ic-wasm).

You can install ic-wasm with `cargo install ic-wasm`. Once installed, you can use it to add the custom sections to your wasm.

Let's say you hav a `whoami.wasm` file, as well as your `whoami.did` and `whoami-meta.json` files. You can add the custom sections with the following commands:

```bash
ic-wasm --output whoami.wasm whoami.wasm metadata --file whoami.did --visibility public candid:service
ic-wasm --output whoami.wasm whoami.wasm metadata --file whoami-meta.json --visibility public dfx
```

Breaking down what's happening - you are telling `ic-wasm` to output the result to `whoami.wasm`, and then you are telling it to add the `candid:service` and `dfx` custom sections to the wasm. The `--visibility` flag tells it to make the custom section public. The `--file` flag tells it where to get the contents of the custom section from.

You can verify the custom sections were added with `ic-wasm whoami.wasm metadata dfx` and `ic-wasm whoami.wasm metadata candid:service`.

Then, you need to publish the wasm as above, and `dfx` will be able to consume it.

### Custom Sections If You Have Init Arguments

If the canister you are publishing has init arguments, you should also provide a `candid:args` custom section. This is done for you with `dfx` automatically, but if you are doing it manually, you can use the did file as a reference. For example, if your candid includes the following:

```
type A = nat;
service : (A, text) -> {
  ...
};
```

Then your `candid:args` would be `(nat, text)`. You can add this custom section with the following command:

```bash
ic-wasm --output whoami.wasm whoami.wasm metadata --data "(nat, text)" --visibility public candid:args
```
