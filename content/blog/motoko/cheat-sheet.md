+++
title = "Motoko Cheat Sheet"
date = "2022-11-14"
image = "/images/motoko-ghost.jpeg"
description = "Quick References for Basic Motoko Syntax"
[taxonomies]
tags = ["dfinity", "motoko", "web development"]
+++

I'm making this for my own reference, but I hope it helps you out as well!

## Language Features

#### Variables

```rust
// Constant variable
let foo = "";
// Stable constant
stable let foo = "";

// Mutable variable
var foo = "";
// Stable mutable
stable var foo = "";
```

#### Conditionals

```rust
let foo = if (true) 1 else 2;

let mut foo2: Nat = 0;

if (true) {
  foo2 := 1;
} else {
  foo2 := 2;
};

// Do block - not always practical but worth knowing
let option = ?3;
let foo3 = do ? {
    let unpackedOption = option!; // the `!` operator "unpacks" the option and gets you the value inside. If the option is null, the entire do ? {} block evaluates to null
    Nat.toText unpackedOption
}

```

#### Assignment

```swift
var foo = "";
foo := "new text";
```

#### Loops

```swift
let items = ["fizz", "buzz", "fizzBuzz"];

for(val in items.vals()){
    Debug.print(debug_show val);
}
```

#### Variants

```swift
type Foo = {
    #bar;
    #baz;
};

type Complex = {
    #foo : Foo;
    #bar : ?Text;
    #baz : [Nat];
};
```

#### Imports

```dart
// base library
import Nat "mo:base/Nat";
// canister import
import Whoami "canister:whoami";
// package import
import IC "mo:management-canister";
```

#### Management Canister

```rust
type IC = actor {
    http_request : Types.CanisterHttpRequestArgs -> async Types.CanisterHttpResponsePayload;
};

let ic : IC = actor ("aaaaa-aa");
```

```rust
import Principal "mo:base/Principal";
import IC "mo:management-canister";


actor Example {

  type CanisterStatus = {
    cycles : Nat;
    idle_cycles_burned_per_day : Nat;
    memory_size : Nat;
    module_hash : ?[Nat8];
    settings : {

    freezing_threshold : Nat;
    controllers : [Principal];
    memory_allocation : Nat;
    compute_allocation : Nat;

    };
    status : {#running; #stopped; #stopping}
  };

  public func status () : async  CanisterStatus {
    let management: IC.Self = actor("aaaaa-aa");
    await management.canister_status({canister_id = Principal.fromActor(Example)});
  };
}
```

For Vessel dependencies, see [Vessel](#vessel)

## Data Structures

### Array

```rust
// init
let arr = [1,2,3];
```

### Iter

```rust
import Iter "mo:base/Iter";

let iter = Iter.make();
let fromArr = Iter.fromArray(arr);

let arr2 = Iter.toArray(fromArr);
```

### Buffer

```rust
import Buffer "mo:base/Buffer";

let arr = [1,2,3];
let buf = Buffer.Buffer<T>(size);

for(x in arr.vals()){
    buf.add(x);
}

let newArr = buf.toArray();

```

### Trie

### TrieMap

### HashMap

## Vessel

```json
// dfx.json
{
  "defaults": {
    "build": {
      "args": "",
      "packtool": "vessel sources"
    }
  }
}
```

```txt
// package-set.dhall
let upstream =
  https://github.com/dfinity/vessel-package-set/releases/download/mo-0.6.21-20220215/package-set.dhall sha256:b46f30e811fe5085741be01e126629c2a55d4c3d6ebf49408fb3b4a98e37589b

let packages = [
  { name = "management-canister"
  , repo = "https://github.com/krpeacock/ic-management-canister"
  , version = "main"
  , dependencies = [ "base" ]
  },
]

in  upstream # packages
```

```txt
// vessell.dhall
{ dependencies = [ "base", "management-canister" ], compiler = Some "0.6.21" }

```
