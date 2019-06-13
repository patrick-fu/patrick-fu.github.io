---
title: LeetCode做题笔记—哈希表相关题目
date: 2019-05-01 15:18:53
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关哈希表的做题笔记，Python实现

<!-- more -->

## 242. 有效的字母异位词 Valid Anagram

[LeetCodeCN 第242题链接](https://leetcode-cn.com/problems/valid-anagram/)

第一种方法：对两个字符串排序后对比

```python
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return sorted(s) == sorted(t)
```

第二种方法：用哈希表对字符串内每个字符计数，最后比对哈希表，这里用dict实现

```python
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        map1, map2 = {}, {}
        for i in s:
            map1[i] = map1.get(i, 0) + 1
        for j in t:
            map2[j] = map2.get(j, 0) + 1
        return map1 == map2
```

第三种方法：由于只有26个小写字母元素，可以用数组自己实现一个哈希表，原理与上面一样

```python
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        map1, map2 = [0]*26, [0]*26
        for c in s:
            map1[ord(c)-ord('a')] += 1
        for d in t:
            map2[ord(d)-ord('a')] += 1
        return map1 == map2
```

## 1. 两数之和 Two Sum

[LeetCodeCN 第1题链接](https://leetcode-cn.com/problems/two-sum/)

第一种方法：用哈希表，时间复杂度是`O(n)`

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        dic = {}
        for i in range(len(nums)):
            if nums[i] in dic:
                return [dic[nums[i]], i]
            else:            
                dic[target - nums[i]] = i
```

第二种方法：暴力两重遍历，这样时间复杂度是`O(n^2)`，在LeetCode里提交会超时

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        for i in range(len(nums)):
            for j in range(i+1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
```

## 15. 三数之和 3Sum

[LeetCodeCN 第15题链接](https://leetcode-cn.com/problems/3sum/)


第一种方法：三重遍历，时间复杂度为`O(n^3)`

第二种方法：两重遍历得到前两个数，然后查询第三个数`-(a+b)`是否存在。用哈希表`set()`

```python
class Solution(object):
    def threeSum(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        if len(nums) < 3:
            return []
        nums.sort()
        res = set()
        for i, v in enumerate(nums[:-2]) :
            if i >= 1 and v == nums[i-1]:
                continue
            d = {}
            for x in nums[i+1:]:
                if x not in d:
                    d[-(v+x)] = 1
                else:
                    res.add((v, -(v+x), x))
        return map(list, res)

```

第三种方法：先升序排序，一遍遍历，然后在后面的新数组里用双指针检查三个数之和是否为0，大于0则右指针向左走，小于0则左指针向右走。

```python
class Solution(object):
    def threeSum(self, nums):
        if len(nums) < 3:
            return []
        nums.sort()
        res = []
        for i, x in enumerate(nums[:-2]):
            if i >= 1 and x == nums[i-1]:
                continue
            l, r = i+1, len(nums)-1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    res.append((nums[i], nums[l], nums[r]))
                    while l < r and nums[l] == nums[l+1]:
                        l += 1
                    while l < r and nums[r] == nums[r-1]:
                        r -= 1
                    l += 1
                    r -= 1
        return res
```

## 146. LRU缓存机制 LRU Cache

[LeetCodeCN 第146题链接](https://leetcode-cn.com/problems/lru-cache/)

利用 Python collections 库内的顺序哈希表 OrderedDict() 类可以很方便地实现

> 一般LRU缓存是通过哈希表配合双向链表实现的。哈希表使访问查找的时间复杂度为O(1)，双向链表可以获得前驱节点使删除操作也是O(1)

![](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20190611173846.jpg)

```python
from collections import OrderedDict
class LRUCache:
    def __init__(self, capacity: int):
        self.dic = OrderedDict()
        self.remain = capacity

    def get(self, key: int) -> int:
        if key not in self.dic:
            return -1
        item = self.dic[key]
        self.dic.pop(key)
        self.dic[key] = item
        return item

    def put(self, key: int, value: int) -> None:
        if key in self.dic:
            self.dic.pop(key)
        else:
            if self.remain > 0:
                self.remain -= 1
            else:
                self.dic.popitem(last=False)
        self.dic[key] = value

# Your LRUCache object will be instantiated and called as such:
# obj = LRUCache(capacity)
# param_1 = obj.get(key)
# obj.put(key,value)
```