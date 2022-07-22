+++
title = "Comparing Cloudflare Workers with Deno Deploy"
description = "Cloudflare Workers and Deno Deploy are both cutting edge serverless computing platforms. In some ways, they are very similar. For example, both platforms implement web APIs such as fetch which are also used in browsers. In other ways, such as package management, they are quite different. This blog post compares the two platforms."
date = 2022-07-08T23:13:54+02:00
lastmod = 2022-07-22T12:13:54+02:00
publishdate = 2022-07-14T12:13:54+02:00
tags = ["cloudflare", "cloudflare deploy", "deno", "deno deploy", "serverless", "web"]
categories = ["development"]
newsletter_groups = ["Web dev"]
draft = false
+++

When it comes to serverless computing platforms, Cloudflare Workers and Deno Deploy are more similar than other platforms in terms of the [standard web API's](https://developer.mozilla.org/en-US/docs/Web/API) they implement. This means that they should be easier to get started with for developers that generally write code that is run in a browser. However, they still differ from each other in a number of other aspects. In this post, I'll be highlighting some of those diferences.

If you want a summary of the most important differences, then you can [skip to the summary at the end of the post](#summary).

{{< tableofcontents >}}
<ol>
  <li><a href="#1-how-easy-is-it-to-get-up-and-running-from-scratch">How easy it it to get up and running from scratch?</a></li>
  <li><a href="#2-developer-and-debugging-experience">Developer and debugging experience</a></li>
  <li><a href="#3-compatible-apis-and-libraries">Compatible APIs and libraries</a></li>
  <li><a href="#4-ecosystem">Ecosystem</a></li>
  <li><a href="#5-regions">Regions</a></li>
  <li><a href="#6-dashboards">Dashboards</a></li>
  <a href="#summary">Summary: positives and negatives of each platform</a>
  <!--
    - (Offline) developing experience/environment
    - Documentation
    - Pricing
  -->
</ol>
{{< /tableofcontents >}}

## 1. How easy is it to get up and running from scratch?

### Deno

The great thing about Deno Deploy is that scripts that Deno compatible libraries (such as the standard library) should run on Deno Deploy just fine without any modifications. For example, say you have a very basic Deno script that calls the standard `serve` function to start a web server:

```ts
import { serve } from "https://deno.land/std@0.119.0/http/server.ts";
function handler(req: Request): Response {
  return new Response("Hello world!");
}
serve(handler);
```

To deploy this to Deno Deploy, commit this file to a GitHub repository and then click on the "New Project" button in the Deno Deploy dashboard. From there, you can choose the GitHub repository as well the file you want to deploy. When you click on "Link", it will package your code and deploy the code.

{{< img src="1-deno-deploy-setup.png" alt="Deno Deploy setup" >}}

Now the code is deployed, you can visit it on the URL Deno Deploy has given to your project.

{{< img src="1-deno-deploy-deployment.png" alt="Deno Deploy deployed project" >}}

### Cloudflare

To get started with Cloudflare Workers, you first need to install their command line interface `wrangler`. You can do this by running `npm install -g wrangler`. You then need to login to your Cloudflare account by running `wrangler login`, which will open the Cloudflare login page in your browser.

Now you can initialize your worker project by running `wrangler init .` in the directory of the worker. The CLI will ask you a few questions so it knows which boilerplate to use and will then download the required npm modules.

{{< img src="1-wrangler-init.png" alt="Running wrangler init in a terminal" >}}

This is the equivalent of the Deno code for Cloudflare Workers: 

{{< highlight ts >}}
addEventListener("fetch", event => {
  event.respondWith(new Response("Hello world!"));
});
{{< /highlight >}}

This code was written in the [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) syntax. New Cloudflare Workers documentation frequently uses JavaScript modules instead now. More on this later.

To deploy your code, you can run `wrangler publish`. The CLI will then show the URL where the worker has been deployed which you will also be able to see in the newly created project in the Workers dashboard.

{{< img src="1-cloudflare-workers-deployment.png" alt="Cloudflare Workers deployed project" >}}

### Conclusion

It's easier to get started with Deno Deploy than Cloudflare Workers because of Deno's integration with GitHub. You can setup a Deno Deploy project by linking it to a GitHub repository, after which it will deploy the Deno-compatible script you've chosen any time a commit is made to the repository. For Cloudflare, you are required to setup the `wrangler` CLI tool and then you can initialize a project with the modules that are generally required to get started. For deployments, you are required to run `wrangler deploy`.

The downside of the Deno is that you are required to use GitHub to be able to create an account with them and that their auto-deployments are also only compatible with GitHub which might turn you away if you don't use GitHub.

## 2. Developer and debugging experience

### Deno

The Deno Deploy playground environment includes a code editor built with Monaco. If you are used to VS Code, this will feel familiar to you as VS Code also uses Monaco. This means you can edit TypeScript or JavaScript code and deploy it without having to leave your browser.

{{< img src="2-deno-deploy-playground.png" alt="Deno Deploy playground" >}}

You can see logs and also set environment variables for the playground. However, it's not possible to resize the logs window which means you can't see much in it. Another thing that isn't possible is editing the code of a project that is connected to a GitHub repository.

However, the playground is in many cases not even neccesary as it's very easy to test a script made for Deno Deploy locally: you can run it just like any other Deno script with `deno run --allow-net [script].ts`. At that point, you can just test your code just like you would any other local web app.


### Cloudflare

Just like the Deno Deploy playground, Cloudflare Workers use Monaco for their code editor so it feels just like VS Code. The Cloudflare Workers playground also includes some familiar tools from the Chrome devtools such as the logs and network panel. The network panel is especially useful as you can see the details of the requests made by the Worker just like you would in a browser. Note that these tools unfortunately do not work outside of Chrome. It's also possible to set the method, headers and body of the HTTP request.

{{< img src="2-cloudflare-workers-playground.png" alt="Cloudflare Workers playground" >}}

Running `wrangler dev` gives you a way to test your Worker before deploying it. However, this developer environment by default isn't actually fully local. This is what the [Cloudflare documentation](https://developers.cloudflare.com/workers/wrangler/commands/#dev) says:

> The `wrangler dev` command that establishes a connection between localhost and a Cloudflare server that hosts your Worker in development. This allows full access to Workers KV and Durable Objects.

To test fully locally, you should run `wrangler dev --local`. This runs a Cloudflare Worker simulation with [Miniflare](https://github.com/cloudflare/miniflare), which used to be a third party project but is now being maintained by Cloudflare.

There are some other quirks that you might have to get used to. In the `wrangler.toml` configuration file, you can configure the project and define environment variables for different environments such as production or staging. ~~However, it doesn't seem like environments are actually well-defined or used within the Cloudflare Workers dashboard itself.~~

**Update:** It seems like Cloudflare are working on [improving environments](https://developers.cloudflare.com/workers/learning/using-services/#service-environments) and are transitioning to a new system in the dashboard. The next version of `wrangler` is supposed to support this new system.

Something to also be aware of is the fact that if you set env variables in the dashboard of a Worker and then publish code to that Worker with a configuration file that doesn't have any env variables, that the env variables initially set in the dashboard will get deleted.

### Conclusion

Both platforms use Monaco for their playgrounds which most developers will feel familiar with. The Deno Deploy playground is lacking is some aspects: the logs panel is not resizable, there is no way to customise HTTP requests and there is no way to explore the requests being made in an execution of a script. These features are implemented in the Cloudflare Workers playground, but some of the devtools are Chrome exclusive.

Testing for Deno Deploy is incredibly easy as you can test it as you would test a normal Deno script. Cloudflare Workers on the other hand requires the `wrangler` CLI which can be quite confusing at times. The CLI includes a simulator which allows you to test not only Workers, but also other Cloudflare serverless services such as their key-value store. However, the testing or developer environment instead defaults to using a bridge between localhost and Cloudflare servers.

Deno Deploy has support for environment variables but only through their dashboard. Cloudflare Workers environment variables can be defined either in the dashboard or the local configuration file.

There is no support for different environments such as production or staging in Deno Deploy. As of the 22nd of July 2022, there is half-baked support for enviroments within Cloudflare Workers, but it seems like Cloudflare are actively transitioning to a system which should allow for better support.

## 3. Compatible APIs and libraries

### Deno

Deno Deploy implements many useful web APIs such as `fetch`, `TextEncoder`, `TextDecoder`, streams and the web crypto API. See [here](https://deno.com/deploy/docs/runtime-api#web-apis) for a full list of implemented APIs.

A few important Deno APIs are also implemented. Most notably, `Deno.startTls`, `Deno.connectTls` and other [low-level API functions](https://deno.com/deploy/docs/hello-world) that are used to create HTTP servers and listen for requests in Deno. This means that the most popular frameworks in Deno such as Oak or Fresh are automatically compatible with Deno and that those projects should run in Deno Deploy **without requiring any changes**.

Other useful APIs that are implemented include [sockets](https://deno.com/deploy/docs/runtime-sockets) which make database connections possible, for example. The [`BroadcastChannel`](https://deno.com/deploy/docs/runtime-broadcast-channel) web API has cleverly been repurposed to allow communication between Deno Deploy instances of the same project in different regions. Lastly, the Deno [file system API](https://deno.com/deploy/docs/runtime-fs) can be used to read static files from your project.

### Cloudflare

Cloudflare Workers implements many of the same web APIs that Deno Deploy also implements. See [here](https://developers.cloudflare.com/workers/runtime-apis/) for the full list.

Just like Deno Deploy, some APIs have been cleverly repurposed to be more useful on the edge. The [`Cache`](https://developers.cloudflare.com/workers/runtime-apis/cache/) API is used to read and write the Cloudflare edge cache which can be incredibly useful if you are using Cloudflare to run a site. As far as I am aware, there is currently [no API to open sockets](https://blog.cloudflare.com/introducing-socket-workers/) like there is in Deno Deploy.

One useful library that Cloudflare Workers have is [`HTMLRewriter`](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/) which is an easy-to-use HTML parser that can be useful in a number of serverless use cases.

### Conclusion

Deno and Cloudflare implement many of the same web APIs. Some APIs have been repurposed to fit the edge better: Deno uses `BroadcastChannel` for communication between deploy instances and Cloudflare uses the `Cache` API to access the edge's cache.

Deno apps should be able to run on Deno Deploy without any modifications whereas projects that are e.g. originally written for Node but will require some changes or adapters before they can run on Cloudflare Workers. However, Service Workers will work perfectly in Cloudflare Workers.

What's notable is that there's now a group called [WinterCG](https://wintercg.org) that is focused on implementing standardised web APIs is runtime environments that aren't browsers. Cloudflare and Deno are both part of this group. Compared to platforms such as AWS Lambda, writing code for Cloudflare Workers or Deno Deploy is often more enjoyable as web developers can use the same well-documented APIs that are used in client-side web apps.


## 4. Ecosystem

### Deno

Deno currently doesn't offer any other service products except from Deno Deploy. However, the fact that it's possible to e.g. [connect to a database server such as Postgres](https://deno.com/deploy/docs/tutorial-postgres) makes up for lack of extra services as you can just use tradional servers for those services.

### Cloudflare

Cloudflare have a number of services that work nicely with Workers:

- [Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv/) is a simple low latency key-value store which can be used with `get` and `put` functions on the store in your Worker. The data in KV is eventually consistent.
- [Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/) is a way to access consistent data storage within a worker. An interesting thing about Durable Objects is that you can [choose with jurisdiction the data is saved in](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/#restricting-objects-to-a-jurisdiction) which is useful if you need to comply with data proctection regulations.
- [R2 (in beta)](https://developers.cloudflare.com/r2/runtime-apis/) is Cloudflare's equivalent of AWS S3, so a way to store large amounts of unstructured data.
- [D1 (also in beta)](https://blog.cloudflare.com/introducing-d1/) is a basically a serverless SQL database.

### Conclusion

Cloudflare has many more services available that work nicely with Workers while Deno currently only has Deno Deploy. Most of these services have to do with storing data in some form of database one way or another. In this sense, Deno makes up for it slightly by making connections with SQL servers possible.

## 5. Regions

### Deno

Currently, Deno Deploy has servers in the 34 different regions listed [here](https://deno.com/deploy/docs/regions). Responses from Deploy should always have a `server` header which tells you which location is being used for your request. For example:

{{< highlight text >}}
server: deno/europe-west9-c
{{< /highlight >}}

This means that the `europe-west9-c` region is being used, which corresponds to Paris. This makes sense as that's currently the closest region to me. What's interesting is that if you look up the server's IP address with a whois tool, you'll see something like this:

{{< highlight text >}}
OrgTechHandle: ZG39-ARIN
OrgTechName:   Google LLC
OrgTechPhone:  +1-650-253-0000
OrgTechEmail:  arin-contact@google.com
OrgTechRef:    https://rdap.arin.net/registry/entity/ZG39-ARIN
{{< /highlight >}}

This tells us that Deno Deploy is actually using Google Cloud for their servers.

### Cloudflare

Cloudflare has a fairly extensive list of their datacenter locations [here](https://www.cloudflare.com/en-gb/network/).

To see which location is serving a request, you can look at the `cf-ray` response header. This will be something like `cf-ray: 5931c7fa3058edfb-CDG`. The last 3 letters indiciate what the closest airport is to the datacenter. In this case, CDG means Charles de Gaulle airport in Paris. Again, this makes sense as Paris is relatively close to me.

### Conclusion

Due to the scale of Cloudflare, Workers currently has more than 250 locations while Deno Deploy is limited to 34 locations.


## 6. Dashboards

### Deno

The dashboard for a Deno Deploy project is fairly simple. There are tabs for analytics, logs and settings. The analytics are basic: a request count and transferred bytes for a 24 hour, 7 day or 30 day period.

{{< img src="5-deno-deploy-dashboard-analytics.png" alt="Deno Deploy dashboard analytics" >}}

The logs tab show you the live logs for the current deployed instances.

{{< img src="5-deno-deploy-dashboard-logs.png" alt="Deno Deploy dashboard logs" >}}

In the settings tab, you can set environment variables, add a domain and so on.

{{< img src="5-deno-deploy-dashboard-settings.png" alt="Deno Deploy dashboard logs" >}}


### Cloudflare

The dashboard for a Worker has 5 tabs: resources, triggers, logs, deployments and settings.

The resources tab shows useful analytics such as the median CPU time per worker execution, the number of requests is a chosen time period and the number of successful and failed executions.

{{< img src="5-cloudflare-workers-dashboard-resources.png" alt="Cloudflare Workers resources dashboard" >}}

The triggers tab allows you to configure the domains and routes that trigger the workers, as well as a configuration for cron triggers which allows you to schedule workers. Setting up a "custom domain" means setting the Worker as an origin for that domain, even though that's also possible with routes. Adding a route or domain means that you have to add that domain to your Cloudflare account which involves changing the nameservers of that domain to Cloudflare and using them as a DNS provider.

{{< img src="5-cloudflare-workers-dashboard-triggers.png" alt="Cloudflare Workers triggers dashboard" >}}

The logs tab allows you to see real-time logs and events in fairly high detail. When clicking on a log, you will be able to see the event's parameters, the log message, the location of the request and so on.

{{< img src="5-cloudflare-workers-dashboard-logs.png" alt="Cloudflare Workers logs dashboard" >}}

Lastly, the deployments tab shows you a list of current deployments with their URLs and the settings tab shows allows you to create environment variables and bindings to other Cloudflare serverless services such as KV.

### Conclusion

Deno Deploy's dashboard provides a better user experience as it is easier and simpler to use. This is due to Cloudflare offering more services that are sometimes required for workers (such as adding a "zone" or domain to your account before you can use it with a worker) or can be used in conjunction with workers (such as KV or durable objects). However, Cloudflare Workers also has useful features that are lacking in Deno Deploy such as more metrics in analytics, cron scheduling and more useful logs.

## Summary

{{< columns type="wide" >}}
  {{< column >}}
    {{< points type="positives" title="Cloudflare Workers positives" >}}
- More than 250 different locations
- Strong ecosystem with other serverless services such as Workers KV
- Playground environment is surprisingly useful and funtional
- Implementation of web APIs such as `fetch`, `TextEncoder`, `TextDecoder` etc.
- Analytics dashboard has a customisable time period as well and different metrics to choose from
- Useful logs with different events and their parameters, such as headers of a response in a fetch
    {{< /points >}}
    {{< points type="negatives" title="Cloudflare Workers negatives" >}}
- Dashboard can feel bloated if you don't use Cloudflare's other services
- No option to link Worker to a git repo
- `wrangler init` required to setup Worker project, installing a number of node modules
- Need to change nameservers of domain to use that domain for a Worker
    {{< /points >}}
  {{< /column >}}
  {{< column >}}
    {{< points type="positives" title="Deno Deploy positives" >}}
- Deno projects work with Deno Deploy straight out of the box providing an intuitive and straightforward developer experience
- Effective, straight to the point dashboard
- Support for connections with database servers because of socket support
- Trigger new deploy on GitHub repo commit
    {{< /points >}}
    {{< points type="negatives" title="Deno Deploy negatives" >}}
- Only 34 different locations
- Playground environment is lacking in some features such being able to set request body, headers, be able to see HTTP requests...
- No support for different environments such as a production or staging environment
- GitHub required to make an account, no support for other git hosters for pulling code
- Limited analytics, no custom time period
    {{< /points >}}
  {{< /column >}}
{{< /columns >}}
