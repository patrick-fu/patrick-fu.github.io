---
title: LeetCode做题笔记—递归、分治相关题目
date: 2019-05-07 10:45:27
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关递归与分治的做题笔记，Python实现

## 50. Pow(x, n)

[LeetCodeCN 第50题链接](https://leetcode-cn.com/problems/powx-n/)

第一种方法：递归

<!-- more -->

```python
class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n == 0:
            return 1
        if n < 0:
            return 1 / self.myPow(x, -n)
        if n % 2:
            return x * self.myPow(x, n - 1)
        return self.myPow(x * x, n / 2)
```

第二种方法：循环

```python
class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x = 1 / x
            n = -n
        ans = 1
        while n:
            # n&1 是与运算，用来求奇偶，效果与 n%2 一样
            if n & 1:
                ans *= x
            x = x * x
            # n>>=1 是位运算，右移一位，效果与 n//=2 一样
            n >>= 1
        return ans
```

## 169. 求众数 Majority Element

[LeetCodeCN 第169题链接](https://leetcode-cn.com/problems/majority-element/)

第一种方法：两重循环暴力求解

第二种方法：哈希表记录每个元素出现次数，发现出现超过`n/2`的就是众数

```python
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        leng = len(nums)
        if leng == 1:
            return nums[0]
        dic = {}
        for i in nums:
            if i in dic:
                dic[i] += 1
                if dic[i] >= leng / 2:
                    return i
            else:
                dic[i] = 1
```

第三种方法：排序后直接返回中间值，因为题目限定条件必然存在众数

```python
def majorityElement(self, nums: List[int]) -> int:
    return sorted(nums)[len(nums)//2]
```

第四种方法：用`list.count()`方法

```python
def majorityElement(self, nums: List[int]) -> int:
    # 此处如果遍历整个nums会超时
    for i in nums[len(nums)//2:]:
        if nums.count(i) > len(nums)//2:
            return i
```

第五种方法：分治

```python
def majorityElement(self, nums):
    if not nums:
        return None
    if len(nums) == 1:
        return nums[0]
    a = self.majorityElement(nums[:len(nums)//2])
    b = self.majorityElement(nums[len(nums)//2:])
    if a == b:
        return a
    return [b, a][nums.count(a) > len(nums)//2]
    
    # 这个 return 的写法等同于下面的 if else
    # 因为若后一个[]里为True即1所以取[b,a][1]=a, False即0取[b,a][0]=b
    # 
    # if nums.count(a) > len(nums)//2:
    #     return a
    # else:
    #     return b
```
