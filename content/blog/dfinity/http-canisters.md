+++
title = "Reimagining Frontend Development on the IC"
date = 2021-04-05
image = "/images/dfinity-logo.jpg"
description = "It's been a few months since I started at Dfinity, and I have an exciting feature to share with you"
[taxonomies]
tags = ["dfinity", "frontend", "web development"]
+++

It's been a while since I posted [my first writeup](/blog/dfinity/getting-started-frontend) on getting started on the Internet Computer. About three months, actually. Could I have written up a few more posts in that time on how I was figuring out the ins and outs of building IC web apps? Sure I could. However, I was convinced that nothing I wrote would ultimately be what I wanted to recommend to the world in general, because I could see a game-changing new technology on the horizon. Thanks to the efforts of the Dfinity Developer Experience team, that new experience is what I'm happy to announce to you today!

My official announcement is posted here: [Dfinity Forum](https://forum.dfinity.org/t/preview-improved-asset-canisters/2387) - it covers some of the same things I'm saying here, but is still worth a read!

Also check out this writeup from another SDK team member on the architecture of our solution: [Technical Overview](https://medium.com/dfinity/a-technical-overview-of-the-internet-computer-f57c62abc20f).

## Announcing Improved Asset Canisters

When you first learn how to build a website, the building blocks all start in a pretty similar way. First, you create an `index.html` file, and fill it out with some content. Next, you style it by creating a `styles.css` file, make some nice designs, and link it in your html file. Finally, if you have some fancy functionality you'd like to add, you attach some JavaScript via an `index.js` file and call it a day.

Until now, building on the IC, we provided you with one `index.html` file that was pre-programmed to do a bunch of fancy things for you. It would load the page, create an anonymous identity using our cryptographically secure messaging library, and request a single bundle of JavaScript. That bundle had a 2MB limit, and could take several seconds before loading your custom content. We only supported that one file being requested, so any HTML, CSS, JavaScript, or images you wanted on the page all had to be crammed into that bundle, which created many significant constraints. While it was still impressive to be able to serve web applications off a blockchain, we knew we could do better, and we wanted to bring things back to that simple pattern of requesting files that the modern web is built on.

![view of assets](/file-structure.png)
A familiar view of static assets in a VSCode editor

With the upgraded asset canister, we are giving engineers the freedom to use their own HTML, images, and whatever arbitrary content they want their canister to provide over standard HTTP requests.

We have unblocked using whatever JavaScript bundler you like, any library or framework you choose, and are no longer even assuming that you'll want to communicate with a smart contract on the IC. An asset canister can now be as unopinionated as a hosting target as a generic Nginx or Express server.

## Deprecations

In order to make this possible, we had to walk back the work we were doing to set you up with an anonymous identity. This means that `window.ic` is going away, and in order to interface with the Internet Computer, you will need to import our code from our npm package `@dfinity/agent`. Agent will provide you with the tools to make requests to Internet Computer canisters, and we have another package `@dfinity/authentication` that will give you the tools to create a cryptographically secure identity that can be managed using the new browser Web Authentication API.

We provide you with the basics of how to get started with the new `dfx new` template. Check out the [writeup](https://www.notion.so/Announcing-Improved-Asset-Canisters-7b5815f6ca46461dae4b7f22501f4e39) for some more details about downloading and getting set up with the preview build of DFX.

It's been a busy week, so that's about all I'll get to today, but soon I'll follow up with my revised guide on getting started doing frontend development on the IC.

## Postscript

I almost forgot! I'm taking ownership of those NPM packages now. There are lots of improvements to look forward to, but my focus will be on improving our documentation for now.

The new docs are hosted as static websites on the IC, which I think is pretty neat.

[Agent Docs](https://peacock.dev/agent-docs)

[Authentication Docs](https://peacock.dev/authentication-docs)
