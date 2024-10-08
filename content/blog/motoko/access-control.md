+++
title = "Access Controls Tutorial"
date = "2023-05-09"
image = "/images/motoko-ghost.jpeg"
description = "Produced for Motoko Bootcamp, this guide shows a minimal example of how to add authentication to your frontend and manage updates in a Motoko canister"
[taxonomies]
tags = ["dfinity", "motoko", "access-control", "authentication"]
+++

Produced for Motoko Bootcamp, this guide shows a minimal example of how to add authentication to your frontend and manage updates in a Motoko canister.

The code for this example is available at [https://github.com/krpeacock/access-control-tutorial](https://github.com/krpeacock/access-control-tutorial). Here is a video I also produced for the 2023 Motoko Bootcamp:

<iframe
  width="560"
  height="315"
  src="https://www.youtube-nocookie.com/embed/5m3Wn8tX9RM"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>

## Concepts

What is "Access Control"? It is a broad term that essentially amounts to "who is allowed to access or change stuff". In cryptography, we accomplish this using [cryptographic signatures
](https://en.wikipedia.org/wiki/Digital_signature). For the Internet Computer, we take these signatures and transform the public key into a (relatively) short format called a [Principal](https://internetcomputer.org/docs/current/references/ic-interface-spec/#principal), which looks like a series of characters, separated by a hyphen (`-`).

Since the Internet Computer automatically validates the signature used to make a call before it even reaches your canister's code, this makes it very convenient to use these Principals as a way to identify a unique user. Notably, Principals can be both a user, or another canister. We use Principals in a number of contexts - the `controllers` that are authorized to make changes to an application are Principals, and the `caller` of any method will also be represented as a Principal. Thanks to the properties of cryptographic signatures, you can be confident that a Principal cannot be faked. It will always be the same person, unless they have had their private key compromised.

## Backend Logic

In Motoko, there are a few tricks you can use for access control purposes. Let's start with the `creator` of the canister itself.

### Creator ID

The simplest way you can set up your Motoko canister is to declare an actor with something like this:

```swift
actor {
    public query func sayHi() : async Text {
        "Hi";
    }
}
```

This is a great place to start, but there is more information you can gather if you need it. First, you can learn the Principal that was responsible for creating the canister in the first place. If you are using [dfx](https://internetcomputer.org/docs/current/references/cli-reference/dfx-parent/), you can check the Principal by labeling the actor as `shared`.

```rust
shared ({ caller }) actor self () {
// ...
```

A pattern that is common for clarity purposes is to rename the `caller` to `"creator"`, which looks like this:

```rust
shared ({ caller = creator }) actor self () {
// ...
```

Then, inside your code, you have access to both `creator`, which will tell you the Principal that created the canister, as well as `self`, which will give you the ability to reference the canister's own Principal.

### Caller ID

The same pattern is available for your methods. If we take the sayHi func above, we can modify it into a "shared" query func, which will give the function access to the caller's Principal.

```swift
public shared query ({caller}) func sayHi() : async Text {
    "Hi, " # Principal.toText(caller);
}
```

## Frontend Logic

In the code sample I've created here, I have written a simple application that tracks the number of times that a particular caller has called the `increment` method.

Most of the logic is simply about enabling this behavior, but I do want to share two useful authentication strategies that the example shows off:

### Ed25519 from Seed

Since it's possible to generate an Ed25519KeyIdentity using a `seed`, this means we can use a passphrase or some other secret to generate an identity. The example does this with a `password` input, and enables you to have reproducible identities using a simple text input. Here's the snippet that makes this work:

```js
export function seedToIdentity(seed) {
  const seedBuf = new Uint8Array(new ArrayBuffer(32));
  if (seed.length && seed.length > 0 && seed.length <= 32) {
    seedBuf.set(new TextEncoder().encode(seed));
    return Ed25519KeyIdentity.generate(seedBuf);
  }
  return null;
}
```

### Internet Identity Web Component

The II web component is a project I spent some time on a few months back. It takes the `@dfinity/auth-client` package and abstracts it with a web component that you can drop into your page with a little less configuration and some nice features. After you log in, the `identity` will be accessible by just checking the button's `identity` attribute.

```js
export const prepareLoginBotton = async (renderCb) => {
  if (!customElements.get("ii-login-button")) {
    customElements.define("ii-login-button", LoginButton);
  }

  // Once the login button is ready, we can configure it to use Internet Identity
  loginButton?.addEventListener("ready", async (event) => {
    if (
      window.location.host.includes("localhost") ||
      window.location.host.includes("127.0.0.1")
    ) {
      loginButton.configure({
        loginOptions: {
          identityProvider: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`,
        },
      });
    }
  });

  loginButton?.addEventListener("login", async (event) => {
    const identity = loginButton?.identity;
    window.identity = identity;
    renderCb();
  });

  // ...
};
```
