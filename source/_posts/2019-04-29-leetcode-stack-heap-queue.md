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

方法一：直接降序排序，然后取第k个元素返回，add时每次都再排序一次，这样时间复杂度为`O(k*logk)`

```python
# 1.直接排序
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

方法二：使用小顶堆实现的优先队列，Python 中标准库 heapq 就是小顶堆，时间复杂度降低为`O(k)`

```python
# 2.小顶堆
import heapq
class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.pool = nums
        heapq.heapify(self.pool)
        self.k = k
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