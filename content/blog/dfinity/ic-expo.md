+++
title = "React Native for IC Apps"
date = "2023-12-08"
image = "/images/dfinity-logo.jpg"
description = "Build a React Native app for the Internet Computer using Expo and Internet Identity"
[taxonomies]
tags = ["dfinity", "react native", "expo", "mobile development"]
+++

## Introduction

This tutorial will walk you through the process of building a React Native app for the Internet Computer using Expo and Internet Identity. It has been a while coming, due to the fact that `@dfinity/agent` has been using `webassembly` modules for verifying BLS signatures, but we now have a solution that works with React Native.

Then, you can install the dependencies in your project:

# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/en/) (version 18 or higher)
- Xcode (for iOS development)
- Android Studio (for Android development)
- (recommended) Apple Developer Account (for iOS development)

## Expo Quickstart

First, you can run the following command to create your app. I'll be naming the project `ic-expo`, but you can name it whatever you want.

```bash
npx create-expo-app ic-expo
```

Then, `cd` into the project. At this point, if you are set up with your preferred development environment, you can run `expo run ios` or `expo run android` to start the app in the simulator. If you are not set up, you can follow the instructions in the [Expo documentation](https://docs.expo.dev/get-started/installation/) to get set up.

## Installing Dependencies

Next, we need to install the dependencies for our app. We will be using `@dfinity/agent` to interact with the Internet Computer, and there are several other necessary dependencies we'll also need to install.

```bash
npm install --save \
@dfinity/agent \
@dfinity/identity \
@dfinity/principal \
@dfinity/candid \
@react-native-async-storage/async-storage \
buffer \
expo-secure-store
```

## Setting up Internet Identity

We will be using Internet Identity to authenticate users. To pull this off, we need to host a website that will process the requests from our app and return a delegation.

I recommend simply dropping the <a href="/ii_integration.zip" download>ii_integration website</a> into your project in `src/ii_integration`. This is a simple website that will handle the requests from our app and return a delegation. Add a `dfx.json` file to the root of your project for the `ii_integration` site, as well as configs for a `whoami` canister and `internet-identity`

```json
// dfx.json
{
  "canisters": {
    "internet-identity": {
      "type": "pull",
      "id": "rdmx6-jaaaa-aaaaa-aaadq-cai"
    },
    "whoami": {
      "type": "pull",
      "id": "ivcos-eqaaa-aaaab-qablq-cai",
      "declarations": {
        "node_compatibility": true
      }
    },
    "ii_integration": {
      "type": "assets",
      "source": ["src/ii_integration/assets", "src/ii_integration/dist"]
    }
  },
  "output_env_file": ".env",
  "version": 1
}
```

## How it works

The `ii_integration` site uses `@dfinity/auth-client` to integrate with Internet Identity. When the page is loaded, it looks for a `redirect_uri` and a `pubkey` in the URL parameters. If it finds these, it will authenticate with Internet Identity and then generate a deep link that will return the delegation to the app. The app will then use this delegation to authenticate calls to the Internet Computer.

The key tricks here are:

### 1. Create the auth-client with a base key from the public key

The IncompleteEd25519KeyIdentity class is a workaround, since the auth-client expects a full keypair. We can get around this by creating an identity with the public key, and then passing it to the auth-client. In the future I'll change the support in the library so the setup is simpler.

```js
// Represent the public key as an identity
class IncompleteEd25519KeyIdentity extends SignIdentity {
  constructor(publicKey) {
    super();
    this._publicKey = publicKey;
  }

  getPublicKey() {
    return this._publicKey;
  }
}

const identity = new IncompleteEd25519KeyIdentity(
  Ed25519PublicKey.fromDer(fromHex(pubKey)),
);

const authClient = await AuthClient.create({
  identity,
});
```

### 2. Generate a deep link to return the delegation to the app

Once the user has authenticated, we can get the delegation from the auth-client and then generate a deep link that will return the delegation to the app. In this case, the identity is abstracted inside of the the `ii-login-button` web component, but the logic is very similar with `@dfinity/auth-client`.

```js
onSuccess: () => {
  const loginButton = document.querySelector("ii-login-button");
  const delegationIdentity = loginButton.identity;

  var delegationString = JSON.stringify(
    delegationIdentity.getDelegation().toJSON(),
  );

  const encodedDelegation = encodeURIComponent(delegationString);
  const url = `${redirectUri}/redirect?delegation=${encodedDelegation}`;
  console.log(`Redirecting to ${url}`);

  //   render button to press when we're done
  const button = document.createElement("button");
  button.innerText = "Continue";
  button.addEventListener("click", () => {
    window.open(url, "_self");
  });
  document.body.appendChild(button);
};
```

## Setting up the app

The app itself will have a very simple structure, so I'll gloss over that a little bit. The App renders a `LoggedIn` view and a `LoggedOut` view, and the `LoggedIn` view will render the `WhoAmI` component to display the user's principal, while the `LoggedOut` view will render the `Pressable` component to allow the user to log in.

The more important logic is contained in the `useAuth` hook, which will handle the authentication logic. It will generate the url to redirect to the `ii_integration` site, and then it will handle the deep link when the delegation is returned.

```js
// src/app/hooks/useAuth.js
import { useState, useEffect } from "react";
import { toHex } from "@dfinity/agent";
import {
  Ed25519KeyIdentity,
  DelegationChain,
  DelegationIdentity,
  isDelegationValid,
} from "@dfinity/identity";
import * as WebBrowser from "expo-web-browser";
import { useURL } from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

async function save(key, value) {
  await SecureStore.setItemAsync(key, value);
}

export function useAuth() {
  const [baseKey, setBaseKey] = useState();
  const [isReady, setIsReady] = useState(false);
  const url = useURL();
  /**
   * @type {[DelegationIdentity | null, React.Dispatch<DelegationIdentity | null>]} state
   */
  const [identity, setIdentity] = useState(null);

  useEffect(() => {
    (async () => {
      const storedKey = await SecureStore.getItemAsync("baseKey");
      if (storedKey) {
        setBaseKey(Ed25519KeyIdentity.fromJSON(storedKey));
      } else {
        const key = Ed25519KeyIdentity.generate();
        setBaseKey(key);
        await save("baseKey", JSON.stringify(key.toJSON()));
      }

      const storedDelegation = await AsyncStorage.getItem("delegation");
      if (storedDelegation) {
        const chain = DelegationChain.fromJSON(JSON.parse(storedDelegation));
        if (isDelegationValid(chain)) {
          const id = new DelegationIdentity(
            Ed25519KeyIdentity.fromJSON(storedKey),
            DelegationChain.fromJSON(JSON.parse(storedDelegation)),
          );
          setIdentity(id);
        } else {
          await SecureStore.deleteItemAsync("delegation");
        }
      }
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    // If we have an identity, we don't need to do anything
    if (identity) return;

    const search = new URLSearchParams(url?.split("?")[1]);
    const delegation = search.get("delegation");
    if (delegation) {
      const chain = DelegationChain.fromJSON(
        JSON.parse(decodeURIComponent(delegation)),
      );
      AsyncStorage.setItem("delegation", JSON.stringify(chain.toJSON()));
      /**
       * @type {DelegationIdentity}
       */
      const id = DelegationIdentity.fromDelegation(baseKey, chain);
      setIdentity(id);

      WebBrowser.dismissBrowser();
    }
  }, [url]);

  // Function to handle login and update identity based on base key
  const login = async () => {
    const derKey = toHex(baseKey.getPublicKey().toDer());
    const url = new URL("https://tdpaj-biaaa-aaaab-qaijq-cai.icp0.io/");

    // Set the redirect uri to the deep link for the app
    // This will be different in a production app
    url.searchParams.set(
      "redirect_uri",
      encodeURIComponent(`com.anonymous.ic-expo://expo-development-client`),
    );

    url.searchParams.set("pubkey", derKey);
    return await WebBrowser.openBrowserAsync(url.toString());
  };

  // Clear identity on logout
  const logout = async () => {
    setIdentity(null);
    await AsyncStorage.removeItem("delegation");
  };

  return {
    baseKey,
    setBaseKey,
    identity,
    isReady,
    login,
    logout,
  };
}
```

TODO: clean up the canister link for `.env` based network configs

### Setting up the agent

Finally, once the delegation identity is ready, we need to pass a couple extra options while setting up the HttpAgent. We need to pass the `identity` and the `host` to the agent, like normal, but we will also need to provide `fetchOptions`, a `blsVerify` function, and `callOptions`. This will look like this:

```js
const agent = new HttpAgent({
  identity,
  host: "https://icp-api.io",
  fetchOptions: {
    reactNative: {
      __nativeResponseType: "base64",
    },
  },
  blsVerify,
  verifyQuerySignatures: true,
  callOptions: {
    reactNative: {
      textStreaming: true,
    },
  },
});
```

## Conclusion

That's it! You should now have a working React Native app that can authenticate with Internet Identity and make calls to the Internet Computer. You can find the full source code for this tutorial at<a href="https://github.com/krpeacock/ic-expo-mvp">https://github.com/krpeacock/ic-expo-mvp</a>.
