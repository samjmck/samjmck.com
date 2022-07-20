+++
title = "What I learned from my failed SaaS business"
description = "I worked a year on a SaaS project. Even though it failed, there are some very valuable lessons that I learned."
date = 2021-08-14T00:25:24+02:00
lastmod = 2021-08-16T19:35:17+02:00
publishdate = 2021-07-16T00:25:24+02:00
tags = ["saas"]
categories = ["development"]
newsletter_groups = ["other"]
draft = false
+++

[Footietracker](https://footietracker.com) was a SaaS project I worked on for slightly longer than a year. It provided users with a Google Sheets document that automatically updated with their portfolios and latest pricing data from Football Index, a football gambling site in the UK that used a virtual stock market to allow users to "invest" in footballers. They are now bankrupt, so development on Footietracker has also halted.

When I started developing Footietracker, I used a microservices architecture. There were 3 services, and they communicated with AMQP through a RabbitMQ server. I quickly realised that this was the wrong choice for the architecture as the 3 services were tightly coupled, which meant they were effectively useless without each other. It also added a lot of unneeded complexity to the development process and running the software. When I realised this, I started migrating back towards a monolith architecture. This eventually became the system that was used in production, and it worked reliably. The software took care of the rest API for user registrations, Stripe webhooks, price updates from the Football Index WebSockets server and updating Google Sheets documents. Unfortunately, the project never really took off and barely broke even each month, even though I was only paying 50 USD to run everything. And a few months after it launched, it was clear that Football Index was going to go into bankruptcy. 

## Most valuable lessons

**1. Make sure your target audience is large enough (or even exists) before starting a SaaS business**

Before I started working on this project, I should've put more effort into checking whether my target audience was large enough and whether enough people in the target audience would be willing to pay. As a result of not doing this, I worked on something that very few people actually needed or wanted.

**2. Start with a monolith and if it grows too large, consider using a different architecture**

In my opinion, if you're a one man show, there's no benefit to using a microservices architecture. It's a perfect example of overengineering and complicates the development process. And you can only reap the benefits of microservices if most services are loosely coupled. In my case, the services were tighly coupled and I struggled to find a way to make them less dependant on each other. This reminded me of the time I tried using NoSQL instead of an SQL-based database and I actually realised that there are nearly always relations in my datasets.

**3. There are very few benefits to using one programming language for a whole project. Use the right tool for the right job.**

I used Node.js, JavaScript and TypeScript for everything. The rationale behind this was that it would be easier for me to work and switch between different parts of the project if everything was in the same programming language. In reality, I found there was no benefit to working this way and that I would've preferred working in a few different languages (such as Golang and PHP) to not only learn more about other languages, but to also make use of those languages' strong points as opposed to using Node.js for everything. The website I made for the project also wasn't an app, it was just a landing page with a simple checkout flow and settings page for users. Using webpack for a site like that was a mistake, as webpack isn't really suited for multi-page sites and it was also slow. Fortunately, the next time I worked on a similar kind of site for a client, I knew exactly what to do and which tools not to use (i.e. webpack and other Node based tooling). 

**4. Always overestimate how much time you'll need for a project**

I thought I would need around 3 months to get everything up and running. Needless to say, that was a fairly severe understatement. It took around a year to get a working version that I was happy with.

## What else I learnt

**1. Browser extension development**

This was my first time developing and publishing a browser extension. It took some time to find a development workflow that worked well, because unfortunately the WebExtensions API that Chrome implements is sometimes slightly different from that of Firefox or Safari. This meant that it was necessary to sometimes code Chrome or Firefox specific things while also keeping a part of the codebase that was cross-browser. Ultimately, I ended up using webpack with different configurations for the two browsers, while also using a polyfill to keep the code compatible with both browsers. Lastly, I had a small shell script that correctly packaged the files so I could submit them to their respective stores. This included the Microsoft Edge Add-ons, Google Chrome Web Store and Add-ons for Firefox. Since then, Apple have also announced that Safari will support the WebExtensions API which means that the extension would've worked on Safari as well.

**2. Web scraping is hard but can be extremely valuable**

Luckily for me, the backend API of Football Index rarely changed and was easy to understand and find using browser network inspectors. This opened many doors to third party tools that implemented features which Football Index never did themselves. This applies to basically any online service, as in theory they can all be scraped.

**3. AMQP**

At the start, while I was still working with a microservices architecture, I opted to use AMQP with a RabbitMQ server to communicate between services. Again, this was overkill, but at least I now understand how those technologies work. I used the `amqplib` library for Node.js, and TypeScript was also very useful in this case as I was able to add typings to the messages.

**4. Docker**

I initially used Docker and Docker Compose to containerize the services and also manage their instances. And even when I moved back to a monolith codebase, I continued to use Docker as I was happy with how everything worked and was configured as soon as I had a working image. Since then, I have used Docker for many different projects so I'm happy I learnt how to write Dockerfiles in this project first.

**5. Google Sheets API**

Google Sheets was crucial to this project as that was the interface users would be using to see their portfolio. Unfortunately, their API and library was an absolute pain to work with. Their documentation was also unclear at times, and I spent a lot more time trying to figure out how everything worked than I should've. Google's API is something I will probably avoid in the future.

**6. Redis**

I used Redis to store pricing data in memory as it needed to be instantly accessible. It was a joy to use, as Redis itself is quite a simple (but very effective) piece of software and the documentation is also clear. I worked with hashes to store sell and buy pricing at a given time and a sorted set to sort the players by their prices. 

**7. Postgres**

Postgres is the database I used to keep a more comprehensive log of all the pricing data as well as to keep user data. I have used MySQL a lot in the past, but I thought that it might be good to try a different database for a change. All in all, I didn't really find many differences with MySQL. I did find it to be slightly more refined than MySQL and I enjoyed certain features such as JSON types, so I will probably continue using Postgres over MySQL in the future.

**8. Stripe**

I used Stripe to manage billing and the checkout process. It was an absolute pleasure to use their libraries and APIs as their documentation is just so good. I used Stripe Checkout to build the checkout process and then the Stripe Billing APIs to manage. I was very happy with the developer experience and how everything worked, so I will definitely use them again in the future.

## List of all technologies used

- **Node.js** with **TypeScript** for the core software
- **Docker** to containerize the software and make it easy to run anywhere
- **Redis** to save and quickly access price updates
- **Postgres** for a more comprehensive log of all price updates
- **Google Sheets API v4** to keep users' portfolios in
- **webpack** to bundle JavaScript for the website, along with **TypeScript** and **SCSS**
- **webpack** again so I could use a polyfill for the browser extension and make it run in Firefox (+ Safari) as well as Chrome and Edge
- **Stripe** for payment processing
- **Figma** to design the website
- **Netlify** to host the website
- **DigitalOcean** with a managed Postgres instance and a VPS with Ubuntu to run the core software

