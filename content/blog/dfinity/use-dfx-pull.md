+++
title = "How to use DFX Pull"
date = 2023-08-08
image = "/images/dfinity-logo.jpg"
description = "How to use pull-enabled canisters in your own project"
[taxonomies]
tags = ["dfinity", "dfx", "canisters"]
+++

- [DFX Pull Docs](https://internetcomputer.org/docs/current/developer-docs/setup/pulling-canister-dependencies/)
- [Making a canister pullable](./making-a-canister-pullable)

# Background

The new DFX Pull feature allows you to pull a canister running on the Internet Computer simply using its canister ID. In practice, it will look something like this:

```json
// dfx.json
{
  "canisters": {
    "whoami": {
      "type": "pull",
      "id": "ivcos-eqaaa-aaaab-qablq-cai"
    }
  }
}
```

"Pull" type canisters will share the same canister ID as they have on the Internet Computer mainnet during local development. The canister can also provide its own candid file, and a url to pull a wasm module from. Dfx can do all this automatically, as long as the canister has chosen to provide this information in its public metadata.

# How to use DFX Pull

Make sure you are using `dfx` 0.14.x or higher. You can check your version by running `dfx --version`, and you can upgrade to the latest release by running `dfx upgrade`.

## Configuring your canister

You will list the canister by whatever name you want to use in your project, and then specify the canister ID. If the canister depends on other canisters, these can also be pulled automatically.

## Pulling a canister

Once you have the canister configured, you can pull it by running two commands:

- `dfx deps pull`
- `dfx deps init`
- `dfx deps deploy`

This will create a `deps` folder with some metadata about the canisters, and allow you to cover any `init` arguments that the canister requires. With the `whoami` example above, no such arguments are required, so you can just run `dfx deploy`, and then `dfx canister call whoami whoami`.

> Note: As of 0.14.4, `dfx deploy` does not automatically deploy your dependencies. You should run `dfx deps deploy` before `dfx deploy` for best results.

That's all you should need to get going! For next steps, check out the [Making a canister pullable](./making-a-canister-pullable) guide.
