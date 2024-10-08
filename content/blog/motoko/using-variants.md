+++
title = "Using Motoko Variants"
date = "2023-10-23"
image = "/images/motoko-ghost.jpeg"
description = "Motoko variants are a powerful way to represent mixed data in a type-safe way."
[taxonomies]
tags = ["dfinity", "motoko", "web development"]
+++

Motoko variants are a cool language feature that lets you tag data with a custom label. In the base form, the label is the entire information that you are storing, similar to an enum. For example,

```rust
type Name = {
    #tag;
};

let name : Name = #tag;
```

As you can see, our variable `name` is of type `Name`, which is a variant with a single tag `#tag`. We can also add a Type to the tag, which looks like this:

```rust
type Name = {
    #tag : Text;
};

let name : Name = #tag "Hello";
```

The tag is separated from the typed value with a simple space. This is not useful yet in this format, since we only are using a single variant. However, this can be expanded to include multiple tags, like this:

```rust
type PetName = {
    #cat : Text;
    #dog : Text;
};

let name : PetName = #cat "Sardine";
```

Now we are able to differentiate cats and dogs in the same type. This is useful for storing data that can be one of multiple types. For example, if we wanted to store a list of pets, we could do this:

```rust
type PetName = {
    #cat : Text;
    #dog : Text;
};

let petList: [PetName] = [#cat "Sardine", #dog "Rex"];
```

This can also be a way to store mixed types. Text is a useful shorthand, but you could also tag your variants as `#text "Some text"`, `#nat 0`, `#int 0`, `#bool true`, etc.

## Using Variants in Functions

To iterate through your list and make choices depending on the variant, you can use a `switch` statement. Here's an example using an array of data that are either Text or Nat types, and returning all the Text values:

```rust
import Buffer "mo:base/Buffer";

actor {

  type TextOrNat = {
    #text: Text;
    #nat: Nat
  };

  var list: [TextOrNat] = [#text "some text", #nat 0, #text "0"];

  public query func getText (): async [Text] {
    let textBuf = Buffer.fromArray<Text>([]);

    for(item in list.vals()) {
      switch(item){
        case (#text t){
          textBuf.add(t);
        };
        case (#nat n){
          // skip
        };
      }
    };
    return Buffer.toArray(textBuf);
  };
};
```

By using the `switch` statement on the `item`, we can set our cases to cover all of the variant tags in our `TextOrNat` type. We handle the tag and then specify a variable name to use for the value. In this case, we are only interested in the `#text` tag, so we add the value to our `textBuf` buffer. If we wanted to handle the `#nat` tag, we could add a case for that as well.

You can see this little example on the Motoko playground at https://m7sm4-2iaaa-aaaab-qabra-cai.raw.ic0.app/?tag=2689482111
