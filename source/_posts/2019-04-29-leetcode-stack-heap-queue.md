---
title: LeetCode做题笔记—栈、堆、队列相关题目
date: 2019-04-29 13:32:28
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关栈、堆、队列的做题笔记，Python实现

# 栈 Stack

## 20. 有效的括号 Valid Parentheses

[LeetCodeCN 第20题链接](https://leetcode-cn.com/problems/valid-parentheses/)

使用 Stack 栈 来操作，用了一个技巧是先做一个字典，`key`为右括号，`value`为左括号。

<!-- more -->

```python
class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')':'(', '}':'{', ']':'['}
        for c in s:
            if c not in mapping:
                stack.append(c)
            elif not stack or mapping[c] != stack.pop():
                return False
        return not stack
```

## 71. 简化路径 Simplify Path

[LeetCode 第71题链接](https://leetcode-cn.com/problems/simplify-path/)

使用栈，遍历用`/`分割后的字符串数组，此时字符串不存在斜杠了，当字符不是空字符或`.`、`..`时即正常路径名压入栈中，当遇到空字符或者`.`时略过，当遇到`..`时`pop`一下即返回上级目录。

```python
class Solution:
    def simplifyPath(self, path: str) -> str:
        stack = []
        for i in path.split('/'):
            if i not in ['', '.', '..']:
                stack.append(i)
            elif i == '..' and stack:
                    stack.pop()
        return '/' + '/'.join(stack)
```



# 堆 Heap

## 703. 数据流中的第K大元素 Kth Largest Element in a Stream

[LeetCodeCN 第703题链接](https://leetcode-cn.com/problems/kth-largest-element-in-a-stream/)

第一种方法：直接对整个`nums`降序排序，然后取第k个元素返回，`add`时每次都再加入进`nums`然后排序一次，这样`add`操作的时间复杂度为`O(n*logn)`，`n`是`nums`的长度

```python
class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.nums = nums
        self.k = k
        self.nums.sort(reverse = True)
        while len(self.nums) > k:
            self.nums.pop()

    def add(self, val: int) -> int:
        self.nums.append(val)
        self.nums.sort(reverse = True)
        if len(self.nums) > self.k:
            self.nums.pop()
        return self.nums[-1]
```

第二种方法：维护一个长度为`k`的数组，初始化时赋值为降序排序后的`nums`的前`k`个元素，`add`操作时先看如果数组长度小于`k`的话就直接加进去然后排序一次，否则就判断如果`val`大于数组末尾的元素就将末尾元素剔除并加入`val`然后排序一次，如果`val`小于等于数组末尾的元素就不操作，这样`add`操作的时间复杂度为`O(k*logk)`，`k`是数组`k`的长度

```python
class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.kl = sorted(nums, reverse=True)[:k]
        self.k = k

    def add(self, val: int) -> int:
        if len(self.kl) < self.k:
            self.kl.append(val)
            self.kl.sort(reverse=True)
        elif val > self.kl[-1]:
            self.kl.pop()
            self.kl.append(val)
            self.kl.sort(reverse=True)
        return self.kl[-1]
```

第三种方法：使用小顶堆实现的优先队列，Python 中标准库 heapq 就是小顶堆，首先将`nums`堆化，然后`pop`元素直到堆的长度为`k`，`add`操作时如果堆中元素不满`k`个就直接把值`push`进堆，如果值大于堆顶元素则更新堆，时间复杂度降低为`O(logk)`

```python
import heapq
class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.pool, self.k = nums, k
        heapq.heapify(self.pool)
        while len(self.pool) > k:
            heapq.heappop(self.pool)

    def add(self, val: int) -> int:
        if len(self.pool) < self.k:
            heapq.heappush(self.pool, val)
        elif val > self.pool[0]:
            heapq.heapreplace(self.pool, val)
        return self.pool[0]

# Your KthLargest object will be instantiated and called as such:
# obj = KthLargest(k, nums)
# param_1 = obj.add(val)
```

## 215. 数组中的第K个最大元素 Kth Largest Element in an Array

[LeetCodeCN 第215题链接](https://leetcode-cn.com/problems/kth-largest-element-in-an-array/)

第一种方法：用库函数排序直接返回第`k`大的元素，时间复杂度`O(n*logn)`

```python
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        return sorted(nums, reverse=True)[k-1]
```

第二种方法：与上题一样，使用小顶堆实现的优先队列，一般情况下时间复杂度为`O(k + (n-k)*logk)`，当`n`极大时，时间复杂度为`O(n*logk)`

```python
import heapq
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = nums[:k]
        heapq.heapify(heap)
        for i in nums[k:]:
            if i > heap[0]:
                heapq.heapreplace(heap, i)
        return heap[0]
```


## 239. 滑动窗口最大值 Sliding Window Maximum

[LeetCodeCN 第239题链接](https://leetcode-cn.com/problems/sliding-window-maximum/)

第一种方法：用优先队列：大顶堆

第二种方法：因为窗口大小固定，只需要一个双端队列即可

```python
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        if not nums:
            return []
        window, res = [], []
        for i, x in enumerate(nums):
            if i >= k and window[0] <= i - k:
                window.pop(0)
            while window and nums[window[-1]] <= x:
                window.pop()
            window.append(i)
            if i >= k - 1:
                res.append(nums[window[0]])
        return res
```