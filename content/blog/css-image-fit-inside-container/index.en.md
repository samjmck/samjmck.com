+++
title = "Making an image fit inside a container"
description = "I want an image to \"fit\" inside a container. By fit, I mean maintaing its aspect ratio but not overflow the container."
date = 2024-11-23T14:41:12+01:00
lastmod = 2024-11-23T14:41:12+01:00
publishdate = 2024-11-23T14:41:12+01:00
tags = ["web", "css"]
categories = ["development"]
newsletter_groups = ["Web dev"]
draft = true
+++

I hope this to be the first blog post in a series where I try to solve a certain web development problem that proved to be more difficult than expected. I've noticed that I often end up solving issues in web development that I've encountered before, but in a different context and maybe in a different form. I hope by writing about these problems, I gain a better understanding of CSS, improve my ability to create a web page that behaves as I intend it to and ultimately evolve to become a better developer.  

I think a good way to approach solving these issues is by thinking about what it is exactly that you're trying to do, maybe outside the context of your current project, isolate that issue and reproduce it in a minimal environment that isn't affected by other libraries or non-related things and gives you a clear view on the issue you're trying to fix. In the case of this, it can simply be an HTML page.

Let's move on to the issue.

## Context

I am creating a website for a friend that contains a lot of images. The images have various dimensions, so they also have different aspect ratios. I don't want any of the images to be so long that they require the user to scroll down the page. 

## Problem description

Given a container with a known width and/or height and a child element that is an image with unknown dimensions, how can we make the image width and/or height in the container while retaining its aspect ratio.

## `<img>` default behaviour

```html
<div>
    <img
        src="1.png"
    />
</div>
<style>
    div {
        width: 400px;
        height: 400px;
    }
</style>
```

This is what that looks like:

{{< img src="screenshots/1.png" alt="img default behaviour showcase" >}}

So, the `img` element is overflowing its parent `div`. The reason for this happening is the following: this `img` element has an intrinsic width and height, which are the dimensions of the actual image. Those values are larger than the dimensions of the container, which is causing the overflow.

## Solutions

### Make width 100% 

```html
<div>
    <img
        src="1.png"
    />
</div>
<style>
    div {
        width: 100px;
    }
    img {
        width: 100%;
    }
</style>
```




