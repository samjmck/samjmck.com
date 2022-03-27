+++
title = "Why the Belgian transaction tax is so confusing"
description = "It boils down to one thing: financial authorities not using the correct identifiers for securities"
date = 2022-03-27T00:32:56+01:00
lastmod = 2022-03-27T00:32:56+01:00
publishdate = 2022-03-27T00:32:56+01:00
tags = ["tax", "FSMA", "brokers", "banks"]
categories = ["finance", "investing"]
+++

## Tax authorities, financial authorities and fund providers

Fund providers can register their funds with the Financial Services and Markets Authority (FSMA) in Belgium if they want to advertise those funds to Belgian investors. However, the tax law says that registered funds have a transaction tax of 1,32%. This rate is notably higher than the 0,12% transaction tax for funds that not registered in Belgium (but are registered in another member of the European Economic Area). For this reason, most Belgian investors avoid purchasing funds that are registered with the Belgian market authorities.

However, there is ambiguity in checking whether a fund is actually registered or not. For some unknown reason, the FSMA lists registered funds by their _name_ and not their International Securities Identifier Number (ISIN). The issue is that a security name does not uniquely determine a specific security as most providers offer different variations of an index fund. For example, Vanguard offers two funds that follows the _FTSE All-World_ index: an accumulating and a distributing version. The exact name of a fund normally depends on the chosen variation. And even for a specific security such as a fund with one variation, the names can vary depending on where you get your information from. Example given: the fund that was just mentioned has the name "Vanguard FTSE All-World UCITS ETF (USD) Accumulating" on justETF and "Vanguard FTSE All-World UCITS ETF USD Acc" on Google.

This means that in practice, a fund name **does not uniquely identify a security**. An ETF's name could refer to either the distributing or accumulating version if you're not careful. This is why many financial authorities and services use ISIN's to identify a specific security. After all, that's what they were designed for:
{{< definition word="ISIN" url="https://committee.iso.org/files/live/sites/tc68/files/Robin%20Doyle/What%20is%20ISIN-Final.pdf" title="ISIN definition from ISO" source="ISO.org" >}}
The purpose of the ISIN is to provide a universally applicable identification number for international securities and derivatives with the goal of reducing delay, **mismatches and confusion** in global financial markets. The first publication of the ISIN, as an ISO standard, was in 1986 to address problems in cross- border settlement of securities and has since been expanded to be used broadly in the **processing of transactions, recordkeeping and regulatory reporting**.
{{< /definition >}}

## Fund providers getting caught up in the mess

The result is that the tax man, brokers and investors now have different interpretations of how certain securities should be taxed. For example, Vanguard provides only Key Investor Information Documents (KIID) [of their distributing securities to their Belgian investors](https://global.vanguard.com/portal/site/kiids/be/en/documents). This indicates Vanguard have only registered the distributing variants of their funds and not the accumulating ones, which makes complete sense: providers know not to register accumulating versions as that means customers would have to pay higher transaction taxes. However, it would be impossible to tell whether the accumulating or distributing variants are registered from looking at the FSMA's list. This is where an ISIN would come in handy.

## Brokers disagreeing with tax authorities

According to De Tijd, [4 out of 8 brokers are charging](https://www.tijd.be/markten-live/fondsen/sectornieuws/banken-rekenen-verschillende-beurstaks-aan-voor-zelfde-tracker/10313628.html) the 0,12% tax rate for the Xtrackers Euro Stoxx 50 ETF and the other half of the brokers are charging 1,32%. Tax authorities claims the registration of a fund happens on the "compartment" level, with the compartment being the "envelope" that bundles the distributing and accumulating version. This obviously doesn't match most brokers' or fund providers' interpretation of the tax law. In fact, the term "compartment" doesn't even seem to be defined properly anywhere outside the tax authorities. What's the compartment of the registered ETF "iShares MSCI EM UCITS ETF USD (Dist)"? Even though clearly the distributing version has been registered, would the accumulating version also count in this case?
