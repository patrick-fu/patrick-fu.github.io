---
title: LeetCode做题笔记—链表相关题目
date: 2019-04-28 16:52:35
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关链表的做题笔记，Python实现

<!-- more -->

## 链表定义
```python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, x):
        self.val = x
        self.next = None
```

## 206. 反转链表 Reverse Linked List

[LeetCodeCN 第206题链接](https://leetcode-cn.com/problems/reverse-linked-list/)

遍历链表，迭代前节点prev，缓存当前节点current的下一节点，然后把当前节点的next指针指向前节点prev

```python
class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        current = head
        prev = None
        while current:
            tmp = current.next
            current.next = prev
            prev = current
            current = tmp
        return prev
```

用Python三元交换能同时赋值不需要缓存的特性可以一行完成交换

```python
class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        current = head
        prev = None
        while current:
            current.next, prev, current = prev, current, current.next
        return prev
```

## 24. 两两交换链表中的节点 Swap Nodes in Pairs

[LeetCodeCN 第24题链接](https://leetcode-cn.com/problems/swap-nodes-in-pairs/)

记录当前节点的前一个节点，当当前节点和下一节点都存在时，三元交换三个节点的next指针
返回交换完后的首节点

```python
class Solution:
    def swapPairs(self, head: ListNode) -> ListNode:
        prev, prev.next = self, head
        while prev.next and prev.next.next:
            l, r = prev.next, prev.next.next
            prev.next, l.next, r.next = r, r.next, l
            prev = l
        return self.next
```

> 看到好多小伙伴在问，我来尝试解释一下“链表交换相邻元素”中 self 是怎么回事。
> 1.首先看到最后 return self.next ，可以看到作者是想把 self 当做链表的头指针使用的（注意：头指针 pHead 与传入的参数 head 是不同的，head 是第一个结点，而 pHead.next == next ）。用头指针有什么好处呢？因为我们让头指针的 next 域（pHead.next）永远指向第一个结点，就是避免最后返回的时候找不到第一个结点了。
> 2.那么作者为什么可以 pre, pre.next = self, head 这样写呢？因为 self 是这个类的一个对象，所以在类定义的时候可以在任何地方，给 self 增加新的属性。相信大家都知道在 __init__(self, attr) 里面可以定义通过 self.myattr = attr 来定义一个 myattr 属性。其实这个语句写在任意一个类的方法里都可以，所以在原文 swapPairs() 里面当然也可以定义新的属性。所以这行代码应该理解为，pre 指向 self（虽然 self 不是一个 ListNode 类型的对象，但它只要有一个 next 就可以了），同时为 pre（同时也是为 self，它们是一样的现在）增加一个 next 属性，这个 next 属性指向第一个结点 head。
> 3.明白上面之后，这里就好办了。在第一次 while 循环的时候，pre.next 被赋值为 b（也就是原来第二个结点，转换为变成了第一个，也就成为了新链表的第一个结点。如果原来是[1,2,3,4]，那么现在就是[2,1,3,4]，这个 self.next 就是指向 2 这个结点）。所以最后只要返回 self.next 就得到了答案。
> 其实换个写法大家就好理解很多了：
> pHead = ListNode(None)
> pre, pre.next = pHead, head
> 也就是说不用 self 也可以，只是原作者秀了一把小技巧而已。

```python
class Solution:
    def swapPairs(self, head: ListNode) -> ListNode:
        pHead = ListNode(None)
        prev, prev.next = pHead, head
        while prev.next and prev.next.next:
            l, r = prev.next, prev.next.next
            prev.next, l.next, r.next = r, r.next, l
            prev = l
        return pHead.next
```

## 141. 环形链表 Linked List Cycle

[LeetCodeCN 第141题链接](https://leetcode-cn.com/problems/linked-list-cycle/)

三种方法
1.硬做，可以设置超时或者固定循环次数，不靠谱
2.做记号，使用set来储存遍历过的节点，需要额外内存空间
3.快慢指针，慢指针每次前移一个节点，快指针每次前移两个节点，如果链表存在循环那快慢指针肯定会相遇

```python
class Solution(object):
    # 1.硬做
    def hasCycle1(self, head):
        """
        :type head: ListNode
        :rtype: bool
        """
        if not head:
            return False
        curr = head
        for i in range(100000):
            curr = curr.next
            if not curr:
                return False
        return True
    
    # 2.set记录
    def hasCycle2(self, head):
        """
        :type head: ListNode
        :rtype: bool
        """
        rec = set()
        curr = head
        while curr:
            if curr in rec:
                return True
            rec.add(curr)
            curr = curr.next
        return False
    
    # 3.快慢指针
    def hasCycle3(self, head):
        """
        :type head: ListNode
        :rtype: bool
        """
        slow = fast = head
        while slow and fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True
        return False
```

## 142. 环形链表 II Linked List Cycle II

[LeetCodeCN 第142题链接](https://leetcode-cn.com/problems/linked-list-cycle-ii/)

第一种方法还是上面的用哈希表set来记录，占用空间

```python
class Solution(object):
    def detectCycle(self, head):
        curr, rec = head, set()
        while curr:
            if curr in rec:
                return curr
            rec.add(curr)
            curr = curr.next
        return None
```

第二种方法用快慢指针，先如上题一样检测是否有环，有的话设置一个新的检测节点从头(head)开始迭代，同时slow节点也继续迭代，直到二者相遇的点就是环的入口节点。

> 原理：
> 首先，头结点到入环结点的距离为a，入环结点到相遇结点的距离为b，相遇结点到入环结点的距离为c。然后，当f以s的两倍速度前进并和s相遇时，f走过的距离是s的两倍，即有等式：a+b+c+b = 2(a+b) ，可以得出 a = c ，所以说，让fast和slow分别从相遇结点和头结点同时同步长出发，他们的相遇结点就是入环结点。
> 当快、慢指针同时从入环点出发，那么一定会在入环点相遇。如果快、慢指针同时从入环点前一节点出发，那么快慢、指针则会在入环点的前一节点相遇，以此类推。

```python
class Solution(object):
    def detectCycle(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
        slow = fast = head
        while slow and fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                detection = head
                while slow != detection:
                    slow = slow.next
                    detection = detection.next
                return detection
        return None
```

## 25. k个一组翻转链表 Reverse Nodes in k-Group

[LeetCodeCN 第25题链接](https://leetcode-cn.com/problems/reverse-nodes-in-k-group/)

第一种方法：利用数组来实现k个一组的翻转，然后重新连接成链表

```python
class Solution:
    def reverseKGroup(self, head: ListNode, k: int) -> ListNode:
        arr, i = [], 0
        if not head:
            return None
        while head:
            arr.append(head)
            head = head.next
        while i <= len(arr) - k:
            arr[i:i+k] = arr[i:i+k][::-1]
            i += k
        for j in range(len(arr) - 1):
            arr[j].next = arr[j+1]
        if arr:
            arr[-1].next = None
            return arr[0]
```

第二种方法：用栈，我们把 k 个数压入栈中，然后弹出来的顺序就是翻转的。这里要注意几个问题：1.剩下的链表个数够不够 k 个（因为不够 k 个不用翻转）；2.已经翻转的部分要与剩下链表连接起来

```python
class Solution:
    def reverseKGroup(self, head: ListNode, k: int) -> ListNode:
        dummy = ListNode(0)
        p = dummy
        while True:
            count = k 
            stack = []
            tmp = head
            while count and tmp:
                stack.append(tmp)
                tmp = tmp.next
                count -= 1
            # 注意,目前tmp所在k+1位置
            # 说明剩下的链表不够k个,跳出循环
            if count : 
                p.next = head
                break
            # 翻转操作
            while stack:
                p.next = stack.pop()
                p = p.next
            #与剩下链表连接起来 
            p.next = tmp
            head = tmp
        return dummy.next
```

第三种方法：递归，利用206题反转链表的函数稍加改造，添加一个count参数提前结束反转。每次递归主函数时即处理当前k个的反转然后链表尾端接上下一个递归的值，注意其中第12行的`head.next`，因为经过上一行的反转后，`head`就成了本次处理k个的末尾节点，`prev`成了本次的头节点，而`new_head`为`head`的下一个节点也即下一个递归的头节点

```python
class Solution:
    def reverseKGroup(self, head: ListNode, k: int) -> ListNode:
        if not head:
            return head
        p, count = head, k
        while p and count:
            p = p.next
            count -= 1
        if count > 0:
            return head
        prev, new_head = self.reverse(head, k)
        head.next = self.reverseKGroup(new_head, k)
        return prev
        
    def reverse(self, node, count):
        if not node:
            return node
        prev, curr = None, node
        while curr and count:
            curr.next, prev, curr = prev, curr, curr.next
            count -= 1
        return (prev, curr)
```

## 2. 两数相加 Add Two Numbers

[LeetCodeCN 第2题链接](https://leetcode-cn.com/problems/add-two-numbers/)

解法很容易想到，但是代码实现不容易，需要小心处理进位

```python
class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = ListNode(0)
        node = dummy
        carry = 0
        while l1 or l2:
            x = l1.val if l1 else 0
            y = l2.val if l2 else 0
            s = carry + x + y
            carry = s//10
            node.next = ListNode(s%10)
            node = node.next
            if l1:
                l1 = l1.next
            if l2:
                l2 = l2.next
        if carry:
            node.next = ListNode(1)
        return dummy.next
```

## 21. 合并两个有序链表 Merge Two Sorted Lists

[LeetCodeCN 第21题](https://leetcode-cn.com/problems/merge-two-sorted-lists/)

第一种方法：迭代，执行逻辑比较直观，由于每个节点仅访问一次，时间复杂度为`O(n+m)`，`n`、`m`分别为两个链表的长度，然后因为仅用到几个辅助变量，空间复杂度为`O(1)`

```python
class Solution:
    def mergeTwoLists(self, l1: ListNode, l2: ListNode) -> ListNode:
        if not l1 and not l2:
            return None
        p = dummy = ListNode(None)
        while l1 and l2:
            if l1.val < l2.val:
                p.next = l1
                l1 = l1.next
            else:
                p.next = l2
                l2 = l2.next
            p = p.next
        p.next = l1 if l1 else l2
        return dummy.next
```

第二种方法：递归，需要递归`n`+`m`次，递归调用栈占用空间，空间复杂度为`O(n+m)`，因为每个节点也只访问一次，时间复杂度`O(n+m)`

```python
class Solution:
    def mergeTwoLists(self, l1: ListNode, l2: ListNode) -> ListNode:
        if not l1:
            return l2
        elif not l2:
            return l1
        if l1.val < l2.val:
            l1.next = self.mergeTwoLists(l1.next, l2)
            return l1
        else:
            l2.next = self.mergeTwoLists(l1, l2.next)
            return l2
```

## 23. 合并K个排序链表 Merge k Sorted Lists

[LeetCodeCN 第23题链接](https://leetcode-cn.com/problems/merge-k-sorted-lists/)

第一种方法：分而治之，利用第21题合并两个有序链表的算法，逐个合并k个链表

```python
class Solution:
    def mergeKLists(self, lists: List[ListNode]) -> ListNode:
        if not lists:
            return None
        self.lists = lists
        return self.divide(0, len(lists)-1)
        
    def divide(self, l, r):
        if l == r:
            return self.lists[l]
        mid = r + (l - r) // 2
        l1 = self.divide(l, mid)
        l2 = self.divide(mid+1, r)
        return self.mergeTwoLists(l1, l2)
            
    def mergeTwoLists(self, l1, l2):
        if not l1 and not l2:
            return None
        p = dummy = ListNode(None)
        while l1 and l2:
            if l1.val < l2.val:
                p.next = l1
                l1 = l1.next
            else:
                p.next = l2
                l2 = l2.next
            p = p.next
        p.next = l1 if l1 else l2
        return dummy.next
```

第二种方法：优先级队列（小顶堆），`Python3`中`heapq`存储对象二元组会导致不可比较的错误，所以用存储三元组，中间用一个数值隔开

```python
import heapq
class Solution:
    def mergeKLists(self, lists: List[ListNode]) -> ListNode:
        if not lists:
            return None
        heap = []
        p = dummy = ListNode(None)
        for i in range(len(lists)):
            if lists[i]:
                heapq.heappush(heap, (lists[i].val, i, lists[i]))
        while heap:
            node = heapq.heappop(heap)
            i = node[1]
            p.next = node[2]
            p = p.next
            if p.next:
                heapq.heappush(heap, (p.next.val, i, p.next))
        return dummy.next
```