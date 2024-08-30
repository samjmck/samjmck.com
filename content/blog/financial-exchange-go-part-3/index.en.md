+++
title = "Developing a financial exchange in Go — Part 3"
description = "In part 3, we extend our codebase so that we can use linked lists as a data structure to store the order book in. This requires some changes to the existing code, but it's a good exercise."
date = 2024-08-24
lastmod = 2024-08-24
publishdate = 2024-08-39
tags = ["finance", "web"]
categories = ["development"]
newsletter_groups = ["Web dev", "Fintech & finance"]
draft = false
+++

This is part 3 in the series of blog posts where I try to create a financial exchange in Go. In [part 1](/en/blog/financial-exchange-go-part-1/), I talked about the core task of an exchange: order matching. After looking at some data structures to do order matching, I settled with using a **sorted list**. In [part 2](/en/blog/financial-exchange-go-part-2/), I implemented those things in Go. In this part, I'm going to extend the codebase so that we can use linked lists as a data structure to store the order book in.

{{< tableofcontents >}}
<ol>
	<li><a href="#sorted-order-list-interface">Sorted order list interface</a></li>
    <li><a href="#slice-implementation">Slice implementation</a></li>
    <li><a href="#linked-list-implementation">Linked list implementation</a></li>
    <li><a href="#testing-both-implementations">Testing both implementations</a></li>
</ol>
{{< /tableofcontents >}}

## Sorted order list interface

We want to allow for order books to be created with different underlying data structures. To be concrete, we want to have a version that simply uses arrays (and slices), and one that uses a linked list. The benefits of using a linked list is that the array doesn't have to get re-allocated or copied on every insert or delete. 

There are a number of operations that we know we need for a sorted order list, namely the operations that we are using in the match and insert function. We can define those operations in an interface and then implement those functions for any type that we want to implement that interface.

So, we are going to change 

```go
type SortedOrderList []Order
```

to this

```go
type SortedOrderList interface {
    // New operations
	Slice() []Order
	Len() int
	Get(index int) Order
	
    // Old operations
	RemoveFirst()
	RemoveLast()
	Insert(o Order)
}
```

There are now a few new operations such as `Slice()`, `Len()`, etc. but also a few of the same old operations such as `RemoveFirst()`, etc.

Note that to change `SortedOrderList`, we used to reassign the variable to whatever the new slice was, as that's how slices work in Go. For example, this was some code in part 2:

```go
if filledShares < order.Shares {
    order.Shares = order.Shares - filledShares
    asks = asks.Insert(order)
}
```

To make the interface slightly more flexible, I decided to _not_ require methods such as `RemoveFirst`, `RemoveLast` and `Insert` to return a new `SortedOrderList` as slices normally would. I thought it would be easier to adhere to this semantic for new implementations versus the other way round. But I'm not entirely sure if this is the idiomatic way to do it.

So the code above has to get changed to the following:

```go
if filledShares < order.Shares {
    order.Shares = order.Shares - filledShares
    asks.Insert(order)
}
```

With these changes and some refactoring, our `orders.go` looks like this:

```go
// orders.go
package main

type SortedOrderList interface {
	Slice() []Order
	Len() int
	Get(index int) Order

	RemoveFirst()
	RemoveLast()
	Insert(o Order)
}

type Order struct {
	IsBuy	bool
	Shares	int
	Price	int
}

func MatchOrInsert(asks SortedOrderList, bids SortedOrderList, order Order) {
	n := 0
	filledShares := 0
	if order.IsBuy {
		// While not all shares of the order have been filled and there
		// there are still asks to match
		for filledShares < order.Shares && asks.Len() > 0 && asks.Get(0).Price <= order.Price {
			n++
			// If the remaining number of shares to fill is equal to or larger than
			// the ask's shares, remove the order
			// Else the remaining number of shares to fill is less than the ask's
			// shares, subtract the remaining number of shares to fill from the ask's
			if order.Shares - filledShares >= asks.Get(0).Shares {
				filledShares = filledShares + asks.Get(0).Shares
				asks.RemoveFirst()
			} else {
				firstOrder := asks.Get(0)
				firstOrder.Shares = firstOrder.Shares - (order.Shares - filledShares)
				filledShares = order.Shares
			}
		}
		// If not all shares were filled, add the order with remaining shares to fill to
		// the bids
		if filledShares < order.Shares {
			order.Shares = order.Shares - filledShares
			bids.Insert(order)
		}
	} else {
		for filledShares < order.Shares && bids.Len() > 0 && bids.Get(bids.Len() - 1).Price >= order.Price {
			n++
			if order.Shares - filledShares >= bids.Get(bids.Len() - 1).Shares {
				filledShares = filledShares + bids.Get(bids.Len() - 1).Shares
				bids.RemoveLast()
			} else {
				lastOrder := bids.Get(bids.Len() - 1)
				lastOrder.Shares = lastOrder.Shares - (order.Shares - filledShares)
				filledShares = order.Shares
			}
		}
		if filledShares < order.Shares {
			order.Shares = order.Shares - filledShares
			asks.Insert(order)
		}
	}
}
```

## Slice implementation

In part 2, we already made the slice implementation of the sorted order list. Now, we have to modify it so that it implements _all_ methods of the interface, and so that the old methods also change the underlying structure as discussed towards the end of the last section. To do so, let's create a new struct that simply wraps around a slice. Then, when we can simply modify the slice in the struct without having to reassign the struct itself everytime. Our `slices_orders.go` file looks like this:

```go
// slice_orders.go
package main

import "slices"

type SliceSortedOrderList struct {
	slice []Order
}

func NewSliceSortedOrderList() *SliceSortedOrderList {
	return &SliceSortedOrderList{ slice: []Order{} }
}

func (l *SliceSortedOrderList) Slice() []Order {
	return l.slice
}

func (l *SliceSortedOrderList) Len() int {
	return len(l.slice)
}

func (l *SliceSortedOrderList) Get(index int) Order {
	return l.slice[index]
}

func (l *SliceSortedOrderList) RemoveFirst() {
	l.slice = l.slice[1:]
}

func (l *SliceSortedOrderList) RemoveLast() {
	l.slice = l.slice[:len(l.slice) - 1]
}

func (l *SliceSortedOrderList) Insert(o Order) {
	i := 0
	for i < len(l.slice) && o.Price > l.slice[i].Price {
		i++
	}
	l.slice = slices.Insert(l.slice, i, o)
}
```

What's interesting to note here is that we are using _pointer receivers_ which refers to the `(l *SliceSortedOrderList)` in the function signatures. This is what makes it possible to actually mutate the original struct.

## Linked list implementation 

Now, the easiest part of this is actually implementing the linked list now that we have all interfaces and types in place to do so. As with most linked lists, this one has a node as a head and each node has a reference to a potential next node. To keep the `Len()` method efficient, we will also store the length of the list in the struct so that we don't have to traverse the whole list every time we want to find the length.

Our implementation then looks like this:

```go
package main

type LinkedOrderListNode struct {
	order Order
	next *LinkedOrderListNode
}

type OrderedLinkedOrderList struct {
	len int
	head *LinkedOrderListNode
}

func NewOrderedLinkedOrderList() *OrderedLinkedOrderList {
	return &OrderedLinkedOrderList{
		len: 0,
		head: nil,
	}
}

func (l *OrderedLinkedOrderList) Slice() []Order {
	slice := make([]Order, l.Len())
	node := l.head
	for i := 0; node != nil; i++ {
		slice[i] = node.order
		node = node.next
	}
	return slice
}

func (l *OrderedLinkedOrderList) Len() int {
	return l.len
}

func (l *OrderedLinkedOrderList) GetNode(index int) *LinkedOrderListNode {
	node := l.head
	for i := 0; i < index; i++ {
		node = node.next
	}
	return node
}

func (l *OrderedLinkedOrderList) Get(index int) Order {
	return l.GetNode(index).order
}

func (l *OrderedLinkedOrderList) RemoveFirst() {
	l.head = l.head.next
	l.len = l.len - 1
}

func (l *OrderedLinkedOrderList) RemoveLast() {
	if l.Len() == 1 {
		l.head = nil
	} else {
		secondToLastNode := l.GetNode(l.Len() - 2)
		secondToLastNode.next = nil
	}
	l.len = l.len - 1
}

func (l *OrderedLinkedOrderList) Insert(o Order) {
	if l.Len() == 0 {
		l.head = &LinkedOrderListNode{
			order: o,
			next: nil,
		}
	} else {
		node := l.head
		for node.next != nil && node.next.order.Price < o.Price {
			node = node.next
		}
		insertedNode := &LinkedOrderListNode{
			order: o,
			next: node.next,
		}
		node.next = insertedNode
	}

	l.len = l.len + 1
}

```

## Testing both implementations

Lastly, we've got to modify our main function so that 1) it stops reassigning the order lists since that is no longer required with our new interface and 2) that we test the slice implementation as well as the ordered linked list implementation. Let's create a new `Test` function that takes two sorted lists, asks and bids, as parameters. That way, we can easily test both implementations and check whether the results are the same.

```go
// main.go
package main

import "fmt"

func Test(asks SortedOrderList, bids SortedOrderList) {
	order := Order{ IsBuy: true, Shares: 100, Price: 100 }
	MatchOrInsert(asks, bids, order)

	order = Order{ IsBuy: true, Shares: 50, Price: 110 }
	MatchOrInsert(asks, bids, order)

	order = Order{ IsBuy: true, Shares: 25, Price: 105 }
	MatchOrInsert(asks, bids, order)

	// Orders should be bids and should be sorted
	fmt.Printf("asks=%v bids=%v\n", asks.Slice(), bids.Slice())

	// Should not get matched
	order = Order{ IsBuy: false, Shares: 30, Price: 120 }
	MatchOrInsert(asks, bids, order)

	fmt.Printf("asks=%v bids=%v\n", asks.Slice(), bids.Slice())

	// Should match top 2 bids
	order = Order{ IsBuy: false, Shares: 60, Price: 105 }
	MatchOrInsert(asks, bids, order)

	fmt.Printf("asks=%v bids=%v\n", asks.Slice(), bids.Slice())
}

func main() {
	var asks SortedOrderList
	var bids SortedOrderList

	fmt.Println("=== Testing slice order list implementation ===")
	asks = NewSliceSortedOrderList()
	bids = NewSliceSortedOrderList()
	Test(asks, bids)

	fmt.Println("=== Testing linked list order list implementation ===")
	asks = NewOrderedLinkedOrderList()
	bids = NewOrderedLinkedOrderList()
	Test(asks, bids)
}
```

After running:

```
=== Testing slice order list implementation ===
asks=[] bids=[{true 100 100} {true 25 105} {true 50 110}]
asks=[{false 30 120}] bids=[{true 100 100} {true 25 105} {true 50 110}]
asks=[{false 30 120}] bids=[{true 100 100} {true 25 105}]
=== Testing linked list order list implementation ===
asks=[] bids=[{true 100 100} {true 25 105} {true 50 110}]
asks=[{false 30 120}] bids=[{true 100 100} {true 25 105} {true 50 110}]
asks=[{false 30 120}] bids=[{true 100 100} {true 25 105}]
```

The results match, success!
