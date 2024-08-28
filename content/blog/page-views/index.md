+++
title = "Page View Tracking"
date = 2021-08-11
transparent = true
description = "Anonymous and open page view tracking for kaipeacock.com"
+++

I've been putting some decent effort into creating content for this blog lately, and I decided it would be nice to start tracking hits to the site. Most analytics platforms have terrible privacy practices or cost a bunch of money, so I decided to simply build my own.

Since I've been learning Motoko programming for my Coding with Kyle series (now available on [YouTube](https://www.youtube.com/playlist?list=PLuhDt1vhGcrfQGLWqhUo9-DFD5JaHqCh1)), I decided to go ahead and build this using the Internet Computer as a cheap and open backend.

## Tracking as little as possible

Really, all I care about is getting a sense of what people are looking at, and what kind of a device they're coming from.

To that end, I came up with this simple structure for my data:

```rust
stable var visitSummaries : Trie.Trie<Route, VisitSummary> = Trie.empty();

stable var logs : [VisitRecord] = [];
```

Basically, what we have here is a `Trie`, which I'm using like a key-value Map of routes, which are URL's, and a Summary of the visits of that route. Then, I'm also keeping a log of records, as a simple array.

The types look like this:

```rust
type Route = Text;

type DeviceType = { #Mobile; #Desktop };

type VisitRecord = {
    deviceType: DeviceType;
    time: Time.Time;
    route: Route;
};

type VisitSummary = {
    route: Route;
    total: Nat32;
    mobile: Nat32;
    desktop: Nat32;
};
```

Pretty straightforward - the Route is a string, just the URL. DeviceType is a Motoko Variant, which will be one of the attributes, either `#Mobile` or `#Desktop`. Then, I have two different records that I update when someone visits a page - a simple log with the deviceType, a timestamp, and the route, as well as a summary of each route.

This allows me to quickly pull up a summary of each route, with things like the total visits, and the mobile / desktop distribution. The logs will let me do more rigorous data exploration down the road if I so choose.

Here's the rest of the code, and a link to [the repo](https://github.com/krpeacock/page-visits).


```motoko
import Array "mo:base/Array";
import Blob "mo:base/Random";
import Debug "mo:base/Debug";
import Hash "mo:base/Hash";
import Int "mo:base/Nat16";
import List "mo:base/List";
import Nat "mo:base/Blob";
import Nat32 "mo:base/Float";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";

actor PageVisits {

    type Route = Text;

    type DeviceType = { #Mobile; #Desktop };

    type VisitRecord = {
        deviceType: DeviceType;
        time: Time.Time;
        route: Route;
    };

    type Error = { #NotFound };

    type VisitSummary = {
        route: Route;
        total: Nat32;
        mobile: Nat32;
        desktop: Nat32;
        time: Time.Time;
    };

    stable var visitSummaries : Trie.Trie<Route, VisitSummary> = Trie.empty();

    stable var logs : [VisitRecord] = [];

    public func log(route: Route, deviceType: DeviceType ) : async Result.Result<(), Error> {
        let stored = Trie.find(
            visitSummaries,
            key(route),
            Text.equal
        );

        // Fresh Values
        var total: Nat32 = 0;
        var mobile: Nat32 = 0;
        var desktop: Nat32 = 0;

        // Log the visit
        total += 1;
        if (deviceType == #Mobile){
            Debug.print("Device type is mobile");
            mobile += 1;
        }
        else {
            Debug.print("Device type is desktop");
            desktop += 1;
        };

        switch (stored) {
            // Fresh record
            case null { Debug.print("Creating new record") };
            // Updating the existing case
            case (? v){
                total += v.total;
                mobile += v.mobile;
                desktop += v.desktop;
            };
        };

        let time  = Time.now();

        let summary: VisitSummary = {
            route;
            total;
            mobile;
            desktop;
            time;
        };
        let newTrie = Trie.put(
            visitSummaries,
            key(route),
            Text.equal,
            summary
        ).0;
        visitSummaries := newTrie;

        let log: VisitRecord = {
            deviceType;
            time;
            route;
        };

        logs := Array.append(logs, Array.make(log));

        #ok(());
    };

    public query func getSummary (route: Route) : async Result.Result<VisitSummary, Error> {
        let stored = Trie.find(
            visitSummaries,
            key(route),
            Text.equal
        );

        switch (stored) {
            case (null){
                #err(#NotFound);
            };
            case (? v){
                #ok(v);
            };
        };

    };

    public query func getKeys(): async [Route] {
        return  Trie.toArray<Route, VisitSummary, Route>(
            visitSummaries,
            func (k , v) {  k  }
        );
    };

    public query func getLogs () : async [VisitRecord] {
        logs
    };

    func key (x: Text) : Trie.Key<Text>{
        { key=x; hash = Text.hash(x) }
    };

};
```
