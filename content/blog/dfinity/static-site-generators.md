+++
title = "Static Site Generators on the IC"
date = 2021-04-06
image = "/images/dfinity-logo.jpg"
description = "Interested in running a website on a decentralized cloud platform? Follow along as I start from a fresh project and adapt it for the Internet Computer"
[taxonomies]
tags = ["dfinity", "frontend", "web development"]
+++

<style>{`main{text-transform: none;}`}</style>

## Updates

- [Small changes](#0_8_0-changes) to migrate this starter to `dfx 0.8.0`.
- I delivered a talk for our Genesis event, walking through the process of this blog post. That video recording is now available here:

<div class="iframe-container">
<iframe
  width="560"
  height="315"
  src="https://www.youtube-nocookie.com/embed/2miweY9-vZc"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  style={{margin:"auto"}}
></iframe>
</div>

## Intro

Following up on my recent post announcing http-powered canisters, I want to walk through what it takes to build a frontend application on the Internet Computer while taking advantage of the new features we support. If it seems simple, that's great! We worked to make this workflow approachable to engineers who are already used to hosting static assets on Netlify, Fastly, or S3 buckets.

For the sake of this demo, I'll be using Gatsby.js, the framework I use to maintain this blog.

## Getting Started

To begin, I run the command `npm init gatsby`. I'm prompted with "What would you like to call your site?", and I'll call this `phone_book`. I'll use that name for the folder to create as well. Next I'm prompted whether I'll be using a CMS, and I answer "No". I'll select `styled-components` from the styling system prompt as a preference, skip the other optional features, and then we're on our way with a fresh project!

[The Gatsby new project CLI](/gatsby-init.png)

This will set me up with a simple file structure:

```bash
├── README.md
├── gatsby-config.js
├── package-lock.json
├── package.json
└── src
    ├── images
    │   └── icon.png
    └── pages
        ├── 404.js
        └── index.js
```

## Deploy a static site

We can start the project up with `webpack-dev-server` by running `npm run develop`, and we can compile the project into static HTML, CSS, and JavaScript assets with the command `npm run build`.

In order to host the project on the Internet computer, we will need to do the following:

- create and configure a `dfx.json` file at the root of the project
- install the `dfx` SDK
- deploy using the `dfx deploy` command

### Creating dfx.json

Because Gatsby compiles its build output into the `public` directory, our `dfx.json` file will look like this:

```json
// dfx.json
{
  "canisters": {
    "www": {
      "type": "assets",
      "source": ["public"]
    }
  }
}
```

### Installing dfx

You can follow quickstart guide at https://dfinity.org/developers/, or [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/krpeacock/ic-vcf-gatsby)

```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

You'll be prompted to agree to install the latest version, and you should be good to go!

### Deploy your site

You will need to fund your production Canister. I recommend going to https://faucet.dfinity.org and following the directions there to get set up with a Cycles Wallet.

Alternately, I've written a blog post on creating a canister using the NNS app, which you can read at https://kaipeacock.com/blog/dfinity/your-first-canister/.

Start by running `npm run build` to compile your website. You can now run `dfx deploy --network=ic` from the same directory as your `dfx.json` to publish your website to the Sodium network.

> Note: if you used the NNS guide, you will deploy with `dfx deploy --network=ic --no-wallet`

Once your site deploy is finished, you can find your canister id by running `dfx canister id www`, and then navigating to `https://{canisterId}.icp0.io`.

---

## Take a breather

Congratulations! You've deployed your first Internet Computer web application! There's a very good chance that this is your first application built on blockchain technology at all, and that's worth celebrating. You'll see that all your assets from HTML to images are all behaving normally, as if you had pulled them directly from an old-school Nginx or PHP static server.

---

## Customizing the application

Now, let's customize the code here a bit. I want to build a contact book, so let's swap out the logic in `src/pages/index.js` with our new application logic.

<details style={{marginBottom: "1rem"}}>
<summary>The code's a bit long, so <button onClick={(e)=>e.target.parentElement.click()}>click</button> to reveal</summary>

<ContactStartingIndex/>

</details>

Basically, we have a form that can allow a user to create a contact, an input to search for contacts by email address, and a component to render a saved contact.

There are any number of ways that we could persist this information - I might initially start by writing the data to `localStorage`, Firebase, or MongoDB Atlas as simple text, encoded using `JSON.stringify()`. Here, I'll show how to persist that data using a smart contract on the Internet computer.

## Adding a backend

We'll need to make a few changes to modify our project to add a backend canister.

- Add the source code for our contract
- Configure `dfx.json` for the backend canister
- Configure Gatsby to alias our code generated by `dfx`
- Use the `@dfinity/agent` npm package to make calls to the backend with an Actor
- Connect the Actor to our application logic

### Adding our backend logic

I'll create a Motoko canister that will implement the simple logic of setting and getting information, stored in a HashMap.

<ContactMainMo />

Without diving too far into the details here, this code uses a `stable var` to persist our data across upgrades, and initializes a friendly `HashMap` interface, that stores data with a `Text` type key and a `Text` type value.

We then implement our `set` and `get` interfaces, and add `preupgrade` and `postupgrade` hooks, again to persist data across upgrades.

I'll save this to a new folder in my `src` directory, at `src/backend/phone_book/Main.mo`. This code is written in Motoko, a language maintained by Dfinity to specifically cater to the features of the Internet Computer. The IC supports any language tha can compile to Web Assembly, and Rust and C are other popular choices for canister development. For more information on Motoko, check out [the docs](https://sdk.dfinity.org/docs/language-guide/motoko.html).

### Configure dfx.json

Now, we need to configure `dfx` to be aware of our new canister. We'll add a new canister object for it, and we will link it as a dependency for our frontend canister. That looks something like this:

```json
// dfx.json
{
  "canisters": {
    "phone_book": {
      "main": "src/backend/phone_book/Main.mo"
    },
    "www": {
      "dependencies": ["phone_book"],
      "type": "assets",
      "source": ["public"]
    }
  }
}
```

### Configure package.json

We can add logic to copy code declarations from the Canister's interface, by pulling them from `.dfx/local`. To handle this, we will add a `copy:types` script to `package.json`, and have it run before the `npm start` and `npm build` scripts.

```json
"scripts": {
  ...
    "copy:types": "rsync -avr .dfx/$(echo ${DFX_NETWORK:-'**'})/canisters/** --exclude='assets/' --exclude='idl/' --exclude='*.wasm' --delete src/declarations",
    "prestart": "npm run copy:types",
    "prebuild": "npm run copy:types",
}
```

Now, we can deploy our backend locally, and generate those types.

```bash
dfx deploy phone_book
npm run copy:types
```

Now, those files should be available under `src/declarations/phone_book`.

### Configure Gatsby

Next, we'll need to update Gatsby with an alias that points to our declarations. We'll create a `gatsby-node.js` file in the root of our project, and write some code that will use our settings in `dfx.json` to import our custom interfaces for our new backend.

<GatsbyNode />

Additionally, we'll add a proxy to `gatsby-config.js` file, proxying `localhost:8000`, which is the default address for our `dfx` replica.

```ts
// gatsby-config.js
module.exports = {
  siteMetadata: {
    title: "contact book",
  },
  plugins: ["gatsby-plugin-styled-components"],
  proxy: {
    prefix: "/api",
    url: "http://localhost:8000",
  },
};
```

### Finally, wiring up @dfinity/agent

We'll modify our `index.js` page with logic to store submissions from the form on our canister, using the `email` field.

I'll import the actor (doing this as a dynamic import to avoid initializing the HttpAgent during server-side rendering for Gatsby) from the auto-generated type generation that `dfx` provides us using the Candid declarations.

```tsx
React.useEffect(() => {
  import("../declarations/phone_book").then((module) => {
    setActor(module.phone_book);
  });
}, []);
```

We'll use our set method during `handleSubmit` to store the data and then clean up our contact form.

```tsx
actor?.set(email, JSON.stringify(card.toJSON())).then(() => {
  alert("card uploaded!");
  inputs.forEach((input) => {
    input.value = "";
  });
  setImage("");
});
```

and then we will use the `get` method to fetch contacts using the email search.

```tsx
actor?.get(email).then((returnedCard) => {
  if (!returnedCard.length) {
    return alert("No contact found for that email");
  }
  setCard(vCard.fromJSON(returnedCard[0]));
  console.log(returnedCard);
});
```

And now, we have a fully-functioning application we can run on the Internet Computer!

<details style={{marginBottom: "1rem"}}>
<summary><button onClick={(e)=>e.target.parentElement.click()}>Click</button> to reveal the final index.js code</summary>

<ContactStartingIndex/>
</details>

## Wrapping up

Now that we've adapted our codebase, our project structure looks like this:

```bash
├── README.md
├── dfx.json
├── gatsby-config.js
├── gatsby-node.js
├── package-lock.json
├── package.json
└── src
    ├── backend
    │   └── phone_book
    │       └── Main.mo
    ├── images
    │   └── icon.png
    └── pages
        ├── 404.js
        └── index.js
```

We can test the changes locally by running `dfx deploy`. That will build and upload our backend to the local replica. Once that completes, we'll be able to run our frontend using `npm run develop -- --port 3000` again, using all the nice development features such as hot module reloading. We're specifying a port since Gatsby also defaults to port `8000`.

If all goes well, you should be able to test the application locally by submitting and then retrieving a contact using the UI.

![View of successfully retrieving a contact](/contact-card.png)
View of successfully retrieving a contact

And that should be it! You can try these steps yourself, download this example project from https://github.com/krpeacock/ic-vcf-gatsby, or use this guide as a reference to get started with your own projects! We can't wait to see what you build!

<h2 id="0_8_0-changes">0.8.0 Changes</h2>

Updated Aug 16, 2021

In previous versions of this post, I was manually creating an actor file, and I was using a webpack alias to fetch the declarations from `.dfx/local`. I've updated `node-config.js` to use the new `0.8.0` declarations, which are a little simpler, but require a dynamic canister Id from the bundler, depending on whether your code is being run for local development, or pointing to the Internet Computer mainnet.

You should be able to clone the application and follow this guide as it is now with no trouble.
