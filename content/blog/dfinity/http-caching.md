+++
title = "Level up your canister with a Http Cache"
date = 2023-03-10
image = "/images/dfinity-logo.jpg"
description = "Http requests are queries by default, but you may need to upgrade to an update in some cases. This example shows how to cache those results so your users can reap the performance benefits!"
[taxonomies]
tags = ["dfinity", "motoko", "web development"]
+++

Http requests are queries by default, but you may need to upgrade to an update in some cases. This example shows how to cache those results so your users can reap the performance benefits!

Code for this example lives at https://github.com/krpeacock/cache-example.

## Overview

These may be features you are unfamiliar with. The `http_request` API is how the asset canister can deliver assets over HTTPS to serve websites. The boundary node serves requests to a canister's `http_request` endpoint if it's available as a query.

If the request requires an update, for any number of reasons, you can return `upgrade = ?true` in the payload to upgrade the request. According to the [IC Interface Spec](https://internetcomputer.org/docs/current/references/ic-interface-spec#upgrade-to-update-calls):

> If the canister sets `upgrade = opt true` in the `HttpResponse` reply from `http_request`, then the Gateway ignores all other fields of the reply. The Gateway performs an ~update~ call to `http_request_update`, passing the same `HttpRequest` record as the argument, and uses that response instead.
> The value of the upgrade field returned from `http_request_update` is ignored.

This is demonstrated in the [HTTP Counter](https://github.com/dfinity/examples/tree/master/motoko/http_counter) example, which also shows how to accept a POST request in order to make changes to the canister state. Some reasons you may need an update for your method might include

- Modifying state (updating a counter)
- Reading data from another canister
- Certifying a response

I'll hold off on handling certified response case until [this bounty](is completed), but let's focus on the basic case of demonstrating how the upgrade flow works.

## Lifecycle of the process

The request comes in to the `http_request` field. The canister checks the cache for the full `HttpRequest` entry as a key. If a hit is found, it returns it. Otherwise, it returns

```rust
case null {
    Debug.print("Request was not found in cache. Upgrading to update request.\n");
    return {
        status_code = 404;
        headers = [];
        body = Blob.fromArray([]);
        streaming_strategy = null;
        upgrade = ?true;
    };
};
```

By returning `upgrade = ?true`, the rest of the information is disregarded. The request is sent back to the boundary node, which re-requests the same `HttpRequest` again as an update call, hitting the `http_request_update` method.

For this example, all the processing we need is to craft the body of the response as Text, based on all the information contained in the request, plus a timestamp. We add it to the cache, and then return the response.

```rust
Debug.print("Storing request in cache.");
let time = Time.now();
let message = "Request has been stored in cache: \n" # "URL is: " # url # "\n" # "Method is " # req.method # "\n" # "Body is: " # debug_show req.body # "\n" # "Timestamp is: \n" # debug_show Time.now();

let response : HttpResponse = {
    status_code : Nat16 = 200;
    headers = [];
    body = Text.encodeUtf8(message);
    streaming_strategy = null;
    upgrade = null;
};

cache := RBT.put(cache, HTTP.compare_http_request, req, response);

return response;
```

From then on, the cache is populated, and future requests will be able to work as queries over http. A slow request only needs to be handled once, and then all subsequent queries will be fast, much like a traditional architecture.

## Next Steps

To productionize a tool like this, you may want to consider some of the following strategies:

1. Consider what your cache's key should be

It may be simple enough to rely on the `path` of the URL from the `HttpRequest`. Headers for different browsers will frequently be different, but it depends on your application logic whether you may want to serve different payloads based on other components from the request.

2. Cache invalidation

Does data in your application change over time? You may want to add an expiration where the canister will upgrade a request and re-validate the response every hour, day, week, etc. You may want to add a manual call to invalidate all or part of your cache

3. Certified variables

It's currently difficult to implement certified variables in Motoko, but it will be important if you deliver the asset via icp0.io (or ic0.app for legacy canisters). If you have not implemented certification, you will have to access the assets via the `.raw` subdomain, and it will come with less security.

4. Access controls

You may want to deliver assets via http that are only available to certain users. If you are using traditional HTTP, the caller will not be available to you, so you may need to use other strategies, such as query parameters or cookie headers to determine whether that access can be delivered. You may want to provide a different version of a `"/account"` page based on whether the user is logged in, for example, and that might vary on the user making the request. A dynamic page like that might be something you want to exclude from the cache.
