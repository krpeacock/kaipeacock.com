+++
title = "Unit Testing in Motoko"
date = 2022-01-07
image = "/images/motoko-ghost.jpeg"
description = "Some early lessons learned from unit testing a Motoko canister"
[taxonomies]
tags = ["dfinity", "motoko", "unit testing", "development"]
+++

import { TwitterTweetEmbed } from 'react-twitter-embed';

It's been a while since I last wrote a blog post - I've been busy growing the SDK team and working on my new [Invoice Canister](https://forum.dfinity.org/t/payments-invoice-canister-design-review/9843) project. The project ends up scaling to be pretty complex, since I want it to be able to abstract every token ledger on the IC with a single API, and so it led to a larger Motoko codebase than I've written before. As a result, that led me to want a better pattern for testing my code.

## Credit where it's due

After tweeting about my frustrations finding a viable testing pattern, [Paul Young](https://paulyoung.me/) tweeted about a old testing framework he came up with that has since been removed from the [Motoko Base Library](https://github.com/dfinity/motoko-base).

<TwitterTweetEmbed tweetId={"1484700207342239745"} />

Paul linked to a small library called ActorSpec, which is designed to execute batches of tests, grouped by `describe` and `it` blocks, which feels fairly similar to Jest syntax.

## Setting it up

To get started, you'll need to install following the directions at https://github.com/dfinity/vessel.

### Configuring your project

You can find reference code for this next step at https://github.com/krpeacock/motoko-unit-tests. There, you will find examples of a `makefile`, the `vessel.dhall` and `package-set.dhall` files that you will need to get your test suite running.

```yaml
-- vessel.dhall
{ dependencies = [ "base", "matchers" ], compiler = Some "0.6.21" }
```

```yaml
-- package-set.dhall
let upstream =
https://github.com/dfinity/vessel-package-set/releases/download/mo-0.6.20-20220131/package-set.dhall
in  upstream
```

```swift
# Makefile
.PHONY: test

test:
	$(shell vessel bin)/moc -r $(shell vessel sources) -wasi-system-api test/*Test.mo

```

With those files in the root of your project, you can now run `vessel install`, and then you should be good to go with writing your tests.

## Writing tests

In my case, I have added a `Test.mo` file that contains my full suite of unit tests. By moving the core logic out of `main.mo` into the `Utils.mo` file, I can use consistent arguments in a `Types.mo` file for my canister's methods, and then test all the functional logic directly out of `Utils.mo`.

With that, I can use a nice syntax of describe function calls that pass `do {}` blocks that evaluate to true or false. We can then test the functions with various inputs against their expected outputs in under a second (depending on the extent of the functionality).

```swift
# Test.mo
import U  "../src/example/Utils";
import Debug "mo:base/Debug";

import ActorSpec "./utils/ActorSpec";
type Group = ActorSpec.Group;

let assertTrue = ActorSpec.assertTrue;
let describe = ActorSpec.describe;
let it = ActorSpec.it;
let skip = ActorSpec.skip;
let pending = ActorSpec.pending;
let run = ActorSpec.run;

let success = run([
  describe("Example Test Suite", [
    describe("Subgroup", [
      it("should assess a boolean value", do {
        assertTrue(true);
      }),
      it("should sum two positive Nats", do {
        assertTrue(U.sum((1, 2)) == 3);
      }),
      it("should fail a check that doesn't match", do {
        assertTrue(U.sum((1, 2)) == 4);
      }),
      skip("should skip a test", do {
        // Useful for defining a test that is not yet implemented
        true
      }),
    ]),
  ]),
]);

if(success == false){
  Debug.trap("Tests failed");
}


```

## Some limitations

The main limits here are that unit tests will not interact with core replica features. Here is some functionality you will not be able to handle with unit tests in the current state:

- Time
- Calls for randomness
- Inter-canister calls
- Managing state
- Upgrade hooks

For this sort of functionality, I recommend writing end-to-end tests, deploying to alternate "staging" canisters before production, and automating your deployment scripts for consistency.
