+++
title = "Outline: Frontend Architecture and Authentication"
date = 2022-03-08
image = "/images/dfinity-logo.jpg"
description = "Outline for a talk I have presented at ASPLOS 2022 and adapted for Motoko Bootcamp 2022"
[taxonomies]
tags = ["dfinity", "frontend", "web development"]
+++

This is an outline for a talk I have presented at ASPLOS 2022 and adapted for Motoko Bootcamp 2022. It's not fully fleshed out, since I'll be using it to make slides, but I figured I'd publish it anyway in case it is helpful to anyone.

## Trustless Web Applications on the Internet Computer

The Dfinity Foundation has launched the Internet Computer, a general compute platform which is powered by blockchain. Smart contracts run in a WebAssembly environment, and can be used to replace virtually every function possible on traditional cloud platforms.

These smart contracts, which we call canisters, can be thought of as stateful lambda functions. Canisters can be written in any language that compiles to WebAssembly, and are able to respond to HTTP requests and can interact with each other though a standard, backwards-compatible interface language.

### Architectural Overview of the Internet Computer

Much of this segment is borrowed from [IC Whitepaper](https://dfinity.org/whitepaper.pdf), which was written by [Victor Shoup](https://www.shoup.net/), a Principal Researcher at the Dfinity Foundation.

#### What is the Internet Computer?

The Internet Computer (IC) is a platform for executing smart contracts in WebAssembly across a global network of nodes running in independent data centers. This platform was designed from the ground up to be able to scale horizontally, avoiding the scaling and bandwidth challenges presented on Ethereum-like blockchains.

Today, close to a year since the Genesis Mainnet launch event, there are many applications running on the Internet Computer. Social media sites like [DSCVR](https://dscvr.one), [Distrikt](https://distrikt.app), NFT Marketplaces such as [Entrepot.app](https://entrepot.app), and more are running their services on IC canisters. That statement is perhaps understated - to be clear, every aspect of those applications is running on a blockchain platform. This includes:

- Frontend Assets
  - HTML, JS, and CSS, and often images
- No database
  - All user data and state is held directly in smart contracts
- All queries and updates are direct calls to the Internet Computer

#### How is this possible?

> The Internet Computer (IC) is a new platform for executing smart contracts. Here, we use the term “smart contract” in a very broad sense: a general-purpose, tamperproof computer program whose execution is performed autonomously on a decentralized
> public network.

- Network of state machines
  - Machines can be replicated - a replicated set is called a subnet
  - Fault tolerance
  - Storage
- Boundary Nodes
  - Public API
  - Http Interface at [icp-api.io](https://icp-api.io)
- Agents
  - Make calls to the API
  - Identity and Signatures as primitives

##### The IC Replica

Architecture

- Chain Key Cryptography
- Peer-to-peer layer
- Consensus Layer
  - Certified state - ingress goes through consensus
  - Query Calls vs Update Calls

##### Boundary Nodes

- Resolve DNS for `*.ic0.app`
- Offer the API gateway
- Serviceworker and certified assets

##### Network Nervous System

The Internet Computer has a governance system, called the NNS. ICP tokens that are staked into Neurons are able to cast votes on a variety of topics

- Upgrades to the NNS and Ledger
- Upgrades to the execution environment
- Adding new nodes and subnets
- Governance topics and roadmap items

##### Actors and Agents

- Actors are the encouraged model for IC canisters
  - May modify their own private state
  - Communicate with other Actors through messages
- Agents are designed to interact with the [Interface Spec](https://internetcomputer.org/docs/interface-spec/index.html)
  - CBOR encoding
  - Interpreting Candid into an appropriate interface
  - Making query and update calls to the IC API

#### Why does this matter?

- Compared to traditional platforms
  - Security and privacy are top concerns of users
    - Ship your software as a canister, which can be [independently verified](https://covercode.ooo/)
    - Identity as a primitive - apps don't depend on usernames or passwords
  - Simplicity of architecture (stateful lambda)
    - Stable memory allows you to hold your state in memory instead of a database
    - Global distribution and delivery are built-in
  - Composability via Candid
    - Automatically generate interfaces for your client applications
    - Canisters can make calls and interoperate
- Compared to other Crypto
  - Cheaper
  - Faster
  - Offers a full stack

### Serving Certified Web Content

#### Why serve certified web content?

In a traditional application, you rely on the party who is providing your hosting to be a reliable and trustworthy partner.

- Updates
  - With decentralized hosting, we don't rely on any party being trustworthy. Our systems make it impossible to update state without going through consensus, because a malicious node could not produce the correct, matching hash of their state without having the same state as the rest of the subnetwork.
- Queries
  - However, queries fetch state from a single node, optimizing for performance
  - You can always query data via consensus, but to balance the security considerations with performance, we have designed a system to allow fast (<100ms) queries of certified variables / assets

#### Certified Variables

Certified variables allow a user to query some value, and get back that value, along with a certificate, aka a proof that the subnet has agreed on the value. The certificate can be computed ahead of time

Process:

- values are gathered into a labeled state tree
- replicas sign a hash and exchange shares until consensus is reached
- The certificate is passed by a header, along with a pruned representation of the tree
- The certificate can be validated by the agent, and we have utilities for this in `agent-js` and `agent-rs`.

#### Certified Assets

This starts with essentially the same setup as certified variables

- Boundary nodes proxy http requests for assets to canisters with a `http_request` method
- Websites loaded by the boundary nodes deliver a serviceworker hosted at `*.ic0.app`
- Subsequent requests for assets can use normal HTTP GET requests, through the serviceworker.
- The serviceworker validates the certificate headers for all assets

> Limitation - this architecture makes it hard to stream large content

---

### Anonymous Authentication with Internet Identity

Now that the basic stack is explained, let's explore how smart contracts can be used to provide secure authentication across your devices, without requiring email, passwords, phone numbers, or time-based authentication codes.

- An identity is created and stored on the canister, with a list of authenticated devices
- Devices are added via the frontend at identity.ic0.app using the browser WebAuthentication API
  - Biometrics
  - Security Keys
- Delegation Identities are created upon request
  - Secret key is internal to the canister and never revealed
  - Identities resolve to a Principal - our ecosystem's friendly public key format
  - Delegations expire after a configurable amount of time - max 8 days

#### Using an identity

- passed along in request from agent
- principal can be used to represent a user
- can be used to authenticate requests

### Access Control Strategies

- Direct principal-to-user mapping
  - Simplest to get running
- Association of multiple principals to same user (Plug + II, fallbacks)
- Delegation Identities
  Most complicated to set up
