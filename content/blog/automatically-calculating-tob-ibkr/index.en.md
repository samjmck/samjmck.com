+++
title = "Automatically calculate the TOB or Belgian transaction tax for Interactive Brokers or Trading212"
description = "The Belgian stock-exchange transaction tax, also known as the TOB, is difficult to calculate. Luckily, I made a tool that calculates it for you. This post shows you when and how to declare and pay the tax."
date = 2022-08-05T14:53:20+02:00
lastmod = 2022-08-05T14:53:20+02:00
publishdate = 2022-08-06T14:53:20+02:00
tags = ["finance", "tax", "brokers"]
categories = ["finance", "investing"]
newsletter_groups = ["Fintech & finance"]
draft = false
+++

Calculating the Belgian tax on stock-exchange transcations or _taks op beursverrichtingen (TOB)_ is difficult. [I even wrote a whole post about why it's so confusing to calculate](en/blog/problem-with-belgian-transaction-tax/). Domestic brokers automatically declare and pay this tax for you. Most foreign brokers don't.

As I personally use Interactive Brokers, an American broker that doesn't declare nor pay the tax, I ended up developing a web app that calculates the tax for you and provides you with the declaration form. The only thing you have to do is upload your transaction history, send the declaration to the tax authorities and pay the tax. Currently, the app supports Interactive Brokers and Trading 212.

{{< tableofcontents >}}
<ol>
  <li><a href="#1-when-to-declare-and-pay-the-tax">When to declare and pay the tax</a></li>
  <li><a href="#2-how-to-calculate-the-tax">How to calculate the tax</a></li>
  <li><a href="#3-how-to-declare-the-tax">How to declare the tax</a></li>
  <li><a href="#3-how-to-pay-the-tax">How to pay the tax</a></li>
  <a href="#summary">Summary</a>
</ol>
{{< /tableofcontents >}}

## 1. When to declare and pay the tax

As per the instructions on the [tax authorities' website](https://finance.belgium.be/en/experts-partners/investors/tax-stock-exchange-transactions#q3), there are two important dates:

1. The day you pay the tax needs to be the day you declare it.
2. The deadline to pay the tax is last working day of the second month following the transaction date.

For example, if you purchased a stock on the 3rd of January, the deadline to pay the tax is will be the 31st of March if that's a working day.

{{< note >}}
Some websites claim that the tax should be paid on the last working day of the first month following the transaction. I'm not sure if that's correct as this is the example the tax authorities give:

"For example, an instructing party who undertakes transactions that are subject to the tax on stock exchange transactions in July and August, can carry out the payment thereof in September for all transactions that have been undertaken during those two months. Additionally, for the transactions entered into or executed in August, he/she has the possibility to pay the tax in October."
{{< /note >}}

If you frequently purchase and sell securities then it probably makes sense to actually declare and pay all the taxes you owe on those transactions all at once at the end of the second month. Setup a reminder of some sorts to ensure you don't miss the deadline. This means you pay and declare the tax 6 times per year.

For people that only have 1 transaction to month, it's probably easier to declare and pay the tax right after the transaction. You could also declare it every two months of course, but ultimately it's up to you.

## 2. How to calculate the tax

You can visit the tax calculator tobcalc [here](https://tobcalc.com).

For exact steps on how to export your transaction history in the right format on tobcalc, see the following guide for your broker:
- [Interactive Brokers](https://github.com/samjmck/tobcalc/blob/master/docs/brokers/interactive-brokers-guide.md)

The steps for each broker are roughly the same. Download your transaction history for the period that you want to calculate the taxes for, upload your transaction history file to the tobcalc enter your details such as name, national registration number into the calculator and then download the PDF.

The downloaded PDF is the tax declaration you need to send to the tax authorities. It also contains the **total tax you owe the authorities** for the period in your transaction history file.

{{< img src="total-tax.png" alt="Total tax to pay" >}}

## 3. How to declare the tax

[In step 2](#2-how-to-calculate-the-tax), you downloaded the declaration PDF. You now have to send it to the tax authorities. As of 6 August 2022, the email is CPIC.TAXDIV@minfin.fed.be. This may change in the future, so you can find it [here](https://finance.belgium.be/en/experts-partners/investors/tax-stock-exchange-transactions#q3).

## 4. How to pay the tax

[In step 2](#how-to-calculate-the-tax), you also saw how much you owe in taxes in the declaration PDF. As of 6 August 2022, you need to transfer that amount to the following bank account:

```
BE39 6792 0022 9319
PCHQ BE BB
Centre de perception - section taxes diverses
Boulevard du Roi Albert II 33 bte 431
1030 Bruxelles
```

The reference for the transfer should be structured as followed: "TOB/national registration number".

Again, these details may change in the future, so you can find the latest version [here](https://finance.belgium.be/en/experts-partners/investors/tax-stock-exchange-transactions#q3).

## Summary

1. Download your transaction history from your broker for period that you want to pay the taxes for.
2. Fill in your details in [tobcalc](https://tobcalc.com), upload your transaction history and download the declaration PDF.
3. Send the declaration PDF to the email listed on the tax authorities' site. [You can find that email here](https://finance.belgium.be/en/experts-partners/investors/tax-stock-exchange-transactions#q3).
4. Transfer the taxes owed to the bank account of the tax authorities with reference "TOB/national registration number". [The exact details of their bank account and the reference can be found here](https://finance.belgium.be/en/experts-partners/investors/tax-stock-exchange-transactions#q3).






