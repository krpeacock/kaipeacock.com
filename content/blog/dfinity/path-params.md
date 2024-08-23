+++
title = "Motoko Server Path Parameters"
date = "2024-08-23"
description = "Introducing path parameters for Motoko Server"
[taxonomies]
tags = ["dfinity", "motoko", "web development"]
+++

This week, I decided to implement a feature from my backlog for the [Motoko Server](https://mops.one/server) library. It is available now in version `v1.0.0`.

## What are path parameters?

Path parameters are a convention used by Express and other server frameworks. They allow you to use a text string to represent not just the path that a certain handler should use, but also some information you want to gather about the request, informing your code how it should respond. This is an important feature for implementing [REST](https://en.wikipedia.org/wiki/REST) patterns in your server.

For example, if you were building an API that is meant to handle `cats`, a GET request for `/cats` would return all of the cats, or a page of cats if there were simply too many cats to return at once. 

To fetch a single cat, you might pass the ID of the cat as a secondary parameter. `cats/1` would return a cat with an `id` of `1`, if that was how you wanted to keep track of them.

Instead of writing 

```ts
server.get("cats/1")
```

For however many ids you have, you can now set up a handler with

```ts
server.get("cats/:id", func (request, response){
    // ...
})
```

and the request will parse the ID from that position of the path. The library will return any number of path parameters to you as a [TrieMap](https://internetcomputer.org/docs/current/motoko/main/base/TrieMap/) of key / value pairs that you can iterate through or check against.

## Why do this?

It's a pretty powerful feature! I'm working on a full rebuild of this blog using Zola, and I have a little gift list feature I built to keep track of ideas for birthdays or whatever instead of using Amazon or some proprietary tool. I wanted to allow people to "reserve" a specific gift, making coordination easier so people don't buy the same thing. I built a simple canister to handle this, and included the JavaScript agent in that page, and pointed it to the canister.

However, in the refactor, I have zero JavaScript tooling and the site is static. It was a pain to import the agent (this gives me a new problem to solve at work, but that's beside the point), so I decided to upgrade the gift list canister to work over HTTP using [Motoko Server](https://mops.one/server).

Adding in a path for all the gifts was simple, and I could have resorted to using query parameters which were already working but it felt inelegant! Instead I decided to set up a basic handler for `/gift/:id` and added a `/gift/:id/toggle` handler for `POST` requests. Then I was able to handle the GiftItem as a simple stateful web component, written in JS without a bundler, preserving the existing functionality, but with far less overhead

## Example code

Here's how it looks in practice. First, here is the handler in the canister:

```rust
server.get(
    "/gifts/:id",
    func(req : Request, res : ResponseClass) : async Response {
      ignore do ? {

        let id = req.params!.get("id")!;
        let gift = (await getGift(id))!;
        let expiry = { nanoseconds = Int.abs(Time.now() + 100) };
        return res.json({
          status_code = 200;
          body = formatGift(gift);
          cache_strategy = #expireAfter expiry;
        });
      };
      res.json({
        status_code = 404;
        body = "Gift not found";
        cache_strategy = #default;
      });
    },
);
```

And then it can be fetched by the client simply by calling

```js
await fetch(
    `https://${canisterId}.icp0.io/gifts/${this.id}`
).then(async (response) => {
    if (response.ok) {
        const json = await response.json();
        const { status } = json;
        this.updateCheckbox(status);

        return response;
    }
    throw new Error("Network response was not ok.");
});
```

Fully interacting with the canister as a traditional REST-ful backend, handling http calls with certified data

Have fun with this feature!
