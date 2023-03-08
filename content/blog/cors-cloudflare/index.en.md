+++
title = "Using Cloudflare Workers to bypass CORS"
description = "CORS is required for security reasons, but sometimes it can cause performance issues. Using a reverse proxy, I was able to circumvent CORS altogether and improve performance."
date = 2023-03-07T09:48:42+01:00
lastmod = 2023-03-07T09:48:42+01:00
publishdate = 2023-03-08T09:48:42+01:00
tags = ["web", "cloudflare"]
categories = ["development"]
newsletter_groups = ["Web dev"]
draft = true
+++

CORS (Cross-Origin Resource Sharing) is a system that by default restricts browsers from making requests to a different origin than the one the page was loaded from. This is important for security purposes. For example, if you visit a malicious website `thief.com`, it should not be able to make requests to `bank.com` as if it was you. Or imagine the website you are on has been hacked and is serving JavaScript that is sending your credentials to their own server. CORS prevents this from happening.

However, there are legitimate use cases where you want to make requests to a different origin. In many organisations, you have different services being hosted under different _subdomains_. For example, at Greenhill Capital, the dashboard for our members is hosted on `dashboard.greenhillcapital.be`, whereas our API is hosted on `backend.greenhillcapital.be`. In this case, the organisation needs to explicitly tell the browser that it is permitted to make requests from one (sub)domain to another. This is where CORS headers come in.

## Using headers and preflight requests

In the HTTP response of requests sent to `dashboard.greenhillcapital.be`, we can add a header that tells the browser that it is allowed to make requests to `backend.greenhillcapital.be`:

```
Access-Control-Allow-Origin: https://backend.greenhillcapital.be
```

This works for requests that are simply showing content and not actually changing things. Think text, images, video's and so on. If the browser sees that the current origin is not in the response's `Access-Control-Allow-Origin`, it will simply not show the content to the user.

What about requests that do not only show content, but might change data on the server side? Think of a POST request that initiates a bank transfer. Now, by the time the browser has received the response with the CORS header, the transfer has already been initiated. There needs to be a way to check whether the request is allowed before the request is actually sent. This is what preflight requests are for. 

The browser will first send a `OPTIONS` request to the server to check whether the request is allowed. If the server responds with the correct CORS headers, the browser will then send the actual request.

{{< img src="preflight.png" alt="An example of a preflight or OPTIONS request to a server" >}}

These preflight requests only happen under certain circumstances. You can see the difference between so-called "simple requests" and requests that require preflights on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests). This brings us to the reason why I'm writing this post.

## Preflights and performance

Preflight requests solve the security issues we had, but they are not free. For each request that requires a preflight, the browser will now send two requests. In reality, some of these requests will be cached, some happen in parallel, the response might be prepared in the background, some share a persistent TCP connection and so on. The performance hit really depends on the situation. 

In Greenhill Capital's dashboard, the hit seemed relatively large. We are serving data that is needed to create certain charts. Due to legacy reasons, this data is split into 6 requests with small amounts of data. Each request is going to `backend.greenhillcapital.be` which is different to the page's origin domain. 

{{< img src="greenhill-preflight-requests.png" alt="A screenshot of Chrome DevTools showing the network requests in the Greenhill Capital dashboard" >}}

There are first 6 preflight requests followed by 6 actual requests. There are different ways we could solve this:

1. Combine the requests into one so only 1 preflight is required. If the requests are happening in parallel, the effect of this is minimal.
2. Host everything on the same domain to avoid the preflight requests altogether.
3. Use a proxy to make it seem like the requests are coming from the same domain.

The first option wouldn't do much for this dashboard as the requests are happening in parallel and we would rather solve the issue for all requests. Due to the way Google Functions work, the second option was unfortunately not possible. This left us with the third option.

## Proxies and Cloudflare Workers

By using a proxy as the web server that serves the web app and our data, we can ensure that all requests are coming from the same domain. Note that there is still a performance hit, but it is much smaller. The client first makes a request to the proxy, which then makes a request to the actual server. You can minimise the latency by ensuring your proxy is either close to your client or close to the server. Because of the size of Cloudflare's CDN, their edge servers are close to most clients as well as servers and the extra latency is negligible. 

Cloudflare Workers are a serverless platform that allows you to run JavaScript code on Cloudflare's edge servers. Creating a proxy in JavaScript is relatively easy:

```js
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  if(url.pathname.startsWith("/api/v1")) {
    const proxyPath = url.pathname.split("/api/v1");
    if(proxyPath[1] === undefined) {
      return new Response(null, { status: 500 });
    }
    const searchParams = url.searchParams;
    const proxyRequest = new Request(
        `https://backend.greenhillcapital.be${proxyPath[1]}?${searchParams.toString()}`, 
        request
    );
    const proxyResponse = await fetch(proxyRequest);
    return proxyResponse;
  }
  return new Response(null, { status: 500 });
}
```


First, we check whether the request is for the API. Then we basically clone the request but with the URL changed the URL of our backend server. We then return the response from the actual server. Now you can make requests to the backend on the `dashboard.greenhillcapital.be` domain meaning that the browser will not send any preflight requests.

This is the result:

{{< img src="greenhill-after.png" alt="A screenshot of Chrome DevTools showing the network requests in the Greenhill Capital dashboard after using a proxy" >}}

The number of requests has been reduced from 12 to 6 and the total time has been reduced from ~600ms to ~400ms. We still have many improvements to make, but this is a good start.

