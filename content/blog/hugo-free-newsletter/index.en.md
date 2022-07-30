+++
title = "Creating a newsletter for a Hugo site with Cloudflare Workers and MailerLite"
description = ""
date = 2022-07-21T13:55:29+02:00
lastmod = 2022-07-21T13:55:29+02:00
publishdate = 2022-07-21T13:55:29+02:00
tags = []
categories = []
newsletter_groups = []
draft = true
+++

The past week, I've been trying to find the best way to start a newsletter for my blog. I wanted it to be as basic as possible, free, accessible through an API and for subscribers to be able to choose which topics they subscribe to. I settled with [MailerLite](https://mailerlite.com), which offers all the functionality I just mentioned and is free up to 1000 subscribers. The whole setup is quite simple: the subscriber's browser makes a POST request to a Cloudflare Worker endpoint that adds the subscriber's email to the email list of the selected topics through the MailerLite API.

## Requirements
- A Cloudflare account for Cloudflare Workers (or Deno Deploy with some extra work)
- A MailerLite account
- Any website that you are able to modify the HTML of (this tutorial will use Hugo)

{{< tableofcontents >}}
<ol>
	<li><a href="#1-setting-up-the-mailerlite-environment">Setting up the MailerLite environment</a></li>
	<li><a href="#2-deploying-the-cloudflare-worker">Deploying and configuring the Cloudflare Worker</a></li>
	<li><a href="#">Adding the form to your site</a></li>
</ol>
{{< /tableofcontents >}}

## 1. Setting up the MailerLite environment

### Creating a group per topic

The first thing you need to do is sign up for a MailerLite account [here](https://www.mailerlite.com/signup). You will have to answer a few questions about what type of newsletter you'll be creating to make sure you're not using them for spam.

Once you've signed up and are in the dashboard, go to the "Subscribers" section and click on the "Groups" tab. Create a new group for each topic you want readers to be able to subscribe to. If you don't need this functionality and would always like all of your subscribers to receive the same emails, then you don't need to create any groups.

In my case, I will be writing about web development, finance and a few more random topics. I have created 3 groups that corresponds with these topics:

{{< img src="subscribers-groups.png" alt="Creating groups in the subscribers section of the MailerLite dashboard" >}}

### Getting your API token

Navigate to the "Integrations" section of the dashboard and click on the "Use" button in the API row. Now click on "Generate new token" and enter a token name such as "Cloudflare Worker". Keep the token in the tab open or keep it in your downloads until you finish configuring your Cloudflare Worker in the next step.

## 2. Deploying and configuring the Cloudflare Worker

If you haven't already, you'll need to create a Cloudflare account [here](https://dash.cloudflare.com/sign-up). Once you have your account, [install the Workers CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) by running `npm install -g wrangler` and then logging in with `wranger login`.

Clone [this repository](https://github.com/samjmck/cloudflare-workers-mailerlite) by running `git clone https://github.com/samjmck/cloudflare-workers-mailerlite.git`. Run `wrangler publish cloudflare-workers-mailerlite/src/index.ts --name mailerlite` to create the Worker in your Cloudflare account and deploy the code to it.

Now visit the Cloudflare dashboard and go to the `mailerlite` worker. Go to the settings tab, click on variables and click on "edit variables". Add the following environment variables:

- `MAILERLITE_API_TOKEN` should be the token that you created in the previous step
- For each group you created, add a `GROUP_ID_{GROUP_NAME}` variable with the group 


## Why not use the embedded forms MailerLite (or any other mailing service) gives you?

MailerLite also have embedded forms with HTML that you can put in your pages without requiring any extra work, but I like to avoid as adding third party scripts to my site as they are security risks and require extra bandwidth and CPU time for functionality that I probably won't end up using. In this case, the [script I wrote](https://raw.githubusercontent.com/samjmck/cloudflare-workers-mailerlite/master/template/script.js) is 1kB vs the 9kB [script that MailerLite has](https://assets.mailerlite.com/js/universal.js). So using my own script is safer and faster.
