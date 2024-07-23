+++
title = "Developing a financial exchange in Go — Part 2"
description = "In part 2, we start implementing some stuff in Go. We create types for orders and order books, we write a basic algorithm for inserting orders into the book and we write a matching algorithm."
date = 2024-07-23T12:46:15+02:00
lastmod = 2024-07-23T12:46:15+02:00
publishdate = 2024-07-23T12:46:15+02:00
tags = ["finance", "web"]
categories = ["development"]
newsletter_groups = ["Web dev", "Fintech & finance"]
draft = false
+++

This is part 2 in the series of blog posts where I try to create a financial exchange in Go. In [part 1](/en/blog/financial-exchange-go-part-1/), I talked about the core task of an exchange: order matching. After looking at some data structures to do order matching, I settled with using a **sorted list**. Let's try to implement that in Go.

{{< tableofcontents >}}
<ol>
	<li><a href="#setting-up-the-project">Setting up the project</a></li>
	<li><a href="#go-modules-go-packages-and-go-paths">Go modules, Go packages and Go... paths?</a></li>
    <ol>
        <li><a href="#1-go-modules">Go modules</a></li>
        <li><a href="#2-go-packages">Go packages</a></li>
        <li><a href="#3-gopath"><code>$GOPATH</code></a></li>
    </ol>
	<li><a href="#defining-the-type-of-an-order">Defining the type of an order</a></li>
	<li><a href="#sorted-list">Sorted list</a></li>
    <ol>
        <li><a href="#1-removefirst"><code>RemoveFirst</code></a></li>
        <li><a href="#2-removelast"><code>RemoveLast</code></a></li>
        <li><a href="#3-insert"><code>Insert</code></a></li>
    </ol>
    <li><a href="#order-matching">Order matching</a></li>
    <li><a href="#result">Result</a></li>
</ol>
{{< /tableofcontents >}}

## Setting up the project

I'm going to install the latest Go release from [here](https://go.dev/dl/). I can verify that it's installed by running `go version`:

```
$ go version
go version go1.22.5 darwin/amd64
```

Then, after cd'ing to the directory where I want to put my project it, I run `go mod init samjmck/go-exchange` to create a `go.mod` file that tracks the dependencies for this project, as described in the official Go ["Get started"](https://go.dev/doc/tutorial/getting-started) tutorial. Note that I use `samjmck/go-exchange` as a module name, but if this were a module that I would be publishing online, I would have to use the location of the repository, e.g. `github.com/samjmck/go-exchange`. For those interested: Go makes a GET request to that URL and looks in the HTML response for a `go-import` meta tag, like:

```html
<meta name="go-import" content="github.com/samjmck/tobcalc git https://github.com/samjmck/tobcalc.git">
```

It does that if the URL for the module does not have a VCS qualifier such as `.git`, `.fossil` etc. More on that [here](https://go.dev/ref/mod#serving-modules-directly-from-a-proxy).

When learning Go a few years back, I didn't learn the module or package system properly and I remembered being confused by `$GOPATH`, so I'm going to pay a bit more attention to that aspect this time.

## Go modules, Go packages and Go... paths?

The three things I want to understand are:

### 1. Go modules

From ["How to Write Go Code"](https://go.dev/doc/code):

> A _module_ is a collection of related Go packages that are released together. A Go repository typically contains only one module, located at the root of the repository. A file named go.mod there declares the module path: the import path prefix for all packages within the module. The module contains the packages in the directory containing its go.mod file as well as subdirectories of that directory, up to the next subdirectory containing another go.mod file (if any).

So, a module has a `go.mod` file and can have multiple packages. A module is also what gets published, but packages are what get imported. And what are packages exactly?

### 2. Go packages

> Go programs are organized into packages. A _package_ is a collection of source files in the same directory that are compiled together. Functions, types, variables, and constants defined in one source file are visible to all other source files within the same package.

Recall how I said packages are what get imported. The import path for a package is simplty the module path and the subdirectory containing the package.

> For example, the module "golang.org/x/net" contains a package in the directory "html". That package’s path is "golang.org/x/net/html"

From [Alex Edwards](https://www.alexedwards.net/blog/an-introduction-to-packages-imports-and-modules):

> In Go, `main` is actually a special package name which indicates that the package contains the code for an executable application. That is, it indicates that the package contains code that can be built into a binary and run.

So, if you're writing a module that you intend to compile and run at some point, you will probably write that code in the `main` package. If only intend to publish your module as a library for other people to important, then a `main` package is probably not necessary.

Another useful convention to be aware of that Alex mentions is the fact that all packages should have their own directory except for the `main` package code which lives in the root.

### 3. `$GOPATH`

The `$GOPATH` environment variable determines where binaries and modules get installed and cached to on your system. Now, after reading about this, it seems like we shouldn't have to touch this, let alone know what it's used for. I think last time I used Go, that was different. For now, we'll leave it as it is. If I have any issues with it, I will write about it.

Alright, now we've got that out of the way, let's start writing some code.

## Defining the type of an order

First, we're going to define the `Order` struct. An order can be a buy or sell order, for a certain number of shares and for a certain price. And an order can go two ways: it can be a sell or buy order.

```go
type Order struct {
	IsBuy		bool
  Shares	int
  Price		int
}
```

Even though we've only defined one struct so far, there are some important conventions we have to make to prevent any type of ambiguity or confusion later:

1. If `IsBuy` is `true`, it is a buy order. Otherwise, it is a sell order.

We could also create 2 separate types: 1 for a buy order, 1 for a sell order. However, this would add more code and complexity which seems unnecessary.

2. `Shares` and `Price` must always be positive, regardless of whether the order is sell or buy.

Another way to potentially distinguish buy and sell orders from each other without creating 2 types would be having e.g. a negative number of shares/price for sell orders and a positive number when the type is a buy order. But for the case of order matching, it seems easier to me to simply be able to do `order1.Price == order2.Price` instead of `order1.Price * -1 == order2.Price`.

3. The unit of `Price` is 1 euro cent, so 1 euro has the value `100`.

The smallest unit of tradeable currency is 1 cent. We don't work with floats since floats can be imprecise and small errors can accumulate when doing arithmetic with them, which is unacceptable when working with money.

## Sorted list

Now let's figure out how to create a sorted list. We are going to create a new type `SortedList` for this, with the main underlying type being a slice. Then, we define our most important methods for that type.

You may wonder why even create a new type if the underlying type is simply a slice? We could in theory just create those methods as functions that take a slice as an argument. The reason for this basic abstraction is because it could be that in the future, we may want to change the underlying data type of a sorted list. At which point, we would probably have to change the usage of those functions too. With this abstraction, we should be able to just change the implementation of the methods.

```go
type SortedOrderList []Order

func (l SortedOrderList) RemoveFirst() SortedOrderList {}
func (l SortedOrderList) RemoveLast() SortedOrderList {}
func (l SortedOrderList) Insert(o Order) SortedOrderList {}
```

Let's start with the first method.

### 1. `RemoveFirst`

The `RemoveFirst` operation should remove the first element from the slice and return a new slice without that element. We can implement this as follows:

```go
func (l SortedOrderList) RemoveFirst() SortedOrderList {
	return l[1:]
}
```

This is a very simple method, but I'd lile to go into a bit more detail of what's exactly happening here.

Take this example where we are working with an `int` slice:

```go
ints := []int{0, 1, 2}
ints := RemoveFirst(ints)
// ints == []int{1, 2}
```

What are we actually doing here? We have:

1. Created a slice with 3 ints, which is actually a reference to an array with 3 ints
2. Re-assigned the slice to only reference the last 2 elements

The number of values in the slice is referred to as the _length_ of the slice. The number of values in the underlying capacity is its _capacity_. Some interesting behaviour here is that while the Go will increase a slice's capacity if it needs to, it will not shrink a slice's capacity. So if our order book has 100,000 orders at one point but only 1,000 orders at a later point, the slice's capacity will still be 100,000.

### 2. `RemoveLast`

This method will do the same as `RemoveFirst`, except from the other side of the slice.

```go
func (l SortedOrderList) RemoveFirst() SortedOrderList {
	return l[:len(l) - 1]
}
```

### 3. `Insert`

For this, I'm going to use the `slices` package with the `Insert` function. We're going to iterate over all of the orders in the slice and insert it so the slice is sorted from smallest price to largest price. There are some optimisations we could make to the searching algorithm, but we shall leave those till the end.

```go
func (l SortedOrderList) Insert(o Order) SortedOrderList {
	i := 0
	for i < len(l) && o.Price > l[i].Price {
		i++
	}
	return slices.Insert(l, i, o)
}
```

## Order matching

Let's now write a function that will try to match a new order.

```go
func MatchOrInsert(asks SortedOrderList, bids SortedOrderList, order Order) (SortedOrderList, SortedOrderList) {
	n := 0
	filledShares := 0
	if order.IsBuy {
		// While not all shares of the order have been filled and there
		// there are still asks to match
		for filledShares < order.Shares && len(asks) > 0 && asks[0].Price <= order.Price {
			n++
			// If the remaining number of shares to fill is equal to or larger than
			// the ask's shares, remove the order
			// Else the remaining number of shares to fill is less than the ask's
			// shares, subtract the remaining number of shares to fill from the ask's
			if order.Shares - filledShares >= asks[0].Shares {
				filledShares = filledShares + asks[0].Shares
				asks = asks.RemoveFirst()
			} else {
				asks[0].Shares = asks[0].Shares - (order.Shares - filledShares)
				filledShares = order.Shares
			}
		}
		// If not all shares were filled, add the order with remaining shares to fill to
		// the bids
		if filledShares < order.Shares {
			order.Shares = order.Shares - filledShares
			bids = bids.Insert(order)
		}
	} else {
		for filledShares < order.Shares && len(bids) > 0 && bids[len(bids) - 1].Price >= order.Price {
			n++
			if order.Shares - filledShares >= bids[len(bids) - 1].Shares {
				filledShares = filledShares + bids[len(bids) - 1].Shares
				bids = bids.RemoveLast()
			} else {
				bids[len(bids) - 1].Shares = bids[len(bids) - 1].Shares - (order.Shares - filledShares)
				filledShares = order.Shares
			}
		}
		if filledShares < order.Shares {
			order.Shares = order.Shares - filledShares
			asks = asks.Insert(order)
		}
	}
	return asks, bids
}
```

This function seems to have some complicated logic, but it's necessary for partial order filling. Consider the following table:

| **Order type** | **Price** | **Shares** |
|----------------|-----------|------------|
| Buy            | 1.10      | 100        |
| Sell           | 1.10      | 50         |
| Sell           | 1.10      | 60         |

The buy order can get filled, but by multiple sell orders. After being filled, the last sell order will have 10 shares left. This logic takes care of these types of cases. The cases are:

- Buy order gets partially filled, so order gets added to book with remaining shares
- Buy order gets fully filled, order doesn't get added to book
- Buy order gets partially or fully filled by multiple asks, removing the asks from the book that do not have any shares left

And then duplicate those cases for sell orders.

## Result

This is our result for now:

```go
// orders.go

package main

import "slices"

type Order struct {
	IsBuy	bool
	Shares	int
	Price	int
}

type SortedOrderList []Order

func (l SortedOrderList) RemoveFirst() SortedOrderList {
	return l[1:]
}

func (l SortedOrderList) RemoveLast() SortedOrderList {
	return l[:len(l) - 1]
}

func (l SortedOrderList) Insert(o Order) SortedOrderList {
	i := 0
	for i < len(l) && o.Price > l[i].Price {
		i++
	}
	return slices.Insert(l, i, o)
}

// Returns the new asks and new bids
func MatchOrInsert(asks SortedOrderList, bids SortedOrderList, order Order) (SortedOrderList, SortedOrderList) {
	n := 0
	filledShares := 0
	if order.IsBuy {
		// While not all shares of the order have been filled and there
		// there are still asks to match
		for filledShares < order.Shares && len(asks) > 0 && asks[0].Price <= order.Price {
			n++
			// If the remaining number of shares to fill is equal to or larger than
			// the ask's shares, remove the order
			// Else the remaining number of shares to fill is less than the ask's
			// shares, subtract the remaining number of shares to fill from the ask's
			if order.Shares - filledShares >= asks[0].Shares {
				filledShares = filledShares + asks[0].Shares
				asks = asks.RemoveFirst()
			} else {
				asks[0].Shares = asks[0].Shares - (order.Shares - filledShares)
				filledShares = order.Shares
			}
		}
		// If not all shares were filled, add the order with remaining shares to fill to
		// the bids
		if filledShares < order.Shares {
			order.Shares = order.Shares - filledShares
			bids = bids.Insert(order)
		}
	} else {
		for filledShares < order.Shares && len(bids) > 0 && bids[len(bids) - 1].Price >= order.Price {
			n++
			if order.Shares - filledShares >= bids[len(bids) - 1].Shares {
				filledShares = filledShares + bids[len(bids) - 1].Shares
				bids = bids.RemoveLast()
			} else {
				bids[len(bids) - 1].Shares = bids[len(bids) - 1].Shares - (order.Shares - filledShares)
				filledShares = order.Shares
			}
		}
		if filledShares < order.Shares {
			order.Shares = order.Shares - filledShares
			asks = asks.Insert(order)
		}
	}
	return asks, bids
}
```

Let's write a simple main file so we can actually run some code and test it:

```go
// main.go

package main

import "fmt"

func main() {
	asks := SortedOrderList{}
	bids := SortedOrderList{}

	order := Order{ IsBuy: true, Shares: 100, Price: 100 }
	asks, bids = MatchOrInsert(asks, bids, order)

	order = Order{ IsBuy: true, Shares: 50, Price: 110 }
	asks, bids = MatchOrInsert(asks, bids, order)

	order = Order{ IsBuy: true, Shares: 25, Price: 105 }
	asks, bids = MatchOrInsert(asks, bids, order)

	// Orders should be bids and should be sorted
	fmt.Printf("asks=%v bids=%v\n", asks, bids)

	// Should not get matched
	order = Order{ IsBuy: false, Shares: 30, Price: 120 }
	asks, bids = MatchOrInsert(asks, bids, order)

	fmt.Printf("asks=%v bids=%v\n", asks, bids)

	// Should match top 2 bids
	order = Order{ IsBuy: false, Shares: 60, Price: 105 }
	asks, bids = MatchOrInsert(asks, bids, order)

	fmt.Printf("asks=%v bids=%v\n", asks, bids)
}
```
