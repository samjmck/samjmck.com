+++
title = "Configuring Netlify for a multilingual Hugo site"
description = "Hugo has pretty great support for multilingual content, but there are a few things you should do to actually serve the correct content to your visitors."
date = 2020-08-11T21:17:08+02:00
lastmod = 2020-08-11T21:17:08+02:00
publishdate = 2020-08-11T21:17:08+02:00
tags = ["netlify", "hugo"]
categories = ["development"]
draft = true
+++

One of the reasons I chose Hugo for this site was its support for a multilingual mode, which is important to me as I am planning on writing some posts in Dutch. I won't be covering how to setup the multilingual mode in this post, but I will give a couple of useful tips for configuring Netlify with a multilingual Hugo site.

## Server-side rewrite instead of client-side redirect

This tip is only for people who have the `defaultContentLanguageInSubdir` option set to `true` in their Hugo config. The reason for this is that with this option disabled, content that's written in the site's default language will be output to the root of the publish directory, including the `index.html` landing page, which means there is no need for any rewriting.

With this option enabled, all languages will be output to their respective directories. In my case, the content gets put in the `en` and `nl` directories alongside my static files. To compensate for the lack of a `index.html` file, Hugo genereates an alias that tells search engines where to find the real landing page and redirects clients to the directory of your site's default language. It looks like this:

{{< highlight html >}}
<html>
   <head>
      <title>https://sammckenzie.be/en/</title>
      <link rel="canonical" href="https://sammckenzie.be/en/"/>
      <meta name="robots" content="noindex">
      <meta charset="utf-8" />
      <meta http-equiv="refresh" content="0; url=https://sammckenzie.be/en/" />
   </head>
</html>
{{< / highlight >}}

The canonical link element tells search engines that this page is a duplicate of `https://sammckenzie.be/en/`, which is the real landing page. The last meta tag tells the browser to instantly redirect the client to said URL.

The issue with this approach is that it's slow and may be the cause for bad UX: it'll probably take a few hundred milliseconds for the client to load the alias page and *then* they'll be redirected to the real landing page, which might be in the wrong language.

Both of these problems can be solved by rewriting the page based on the language headers the client sends. A rewrite is basically a server-side redirect, and in this case, it provides performance benefits for the client.

I have added a number of options to `_headers` file of my static directory configuration that rewrite requests from `/index.html` as well as the root `/`. These options do the following:
1. Browsers that either have `en` or `nl` as their selected language get served the `index.html` from the language's respective directory, e.g. if the browser's language is `nl` then the `/nl/index.html` file will be served
2. In the case that the browser accepts both languages, `en` will be prioritised as those options are listed first in the configuration
3. Browsers that only accept languages other than `en` and `nl` will get served the site's default language `en`

{{< highlight plaintext >}}
# 200! --> 200 means rewrite instead of redirect, ! means overwrite the Hugo generated index.html alias
# EN language rewrites
/index.html /en/index.html  200! Language=en
/           /en/index.html  200! Language=en

# NL language rewrites
/index.html /nl/index.html  200! Language=nl
/           /nl/index.html  200! Language=nl

# Other language rewrites
/index.html /en/index.html  200!
/           /en/index.html  200!
{{< / highlight >}}
