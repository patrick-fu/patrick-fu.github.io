---
title: LeetCode做题笔记—位运算相关题目
date: 2019-05-13 09:35:25
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关位运算的做题笔记，Python实现

## 191. 位1的个数 Number of 1 Bits

[LeetCodeCN 第191题链接](https://leetcode-cn.com/problems/number-of-1-bits/)

第一种方法：遍历所有二进制位，通过取模`n%2`或者与运算`n&1`判断尾数是否为1，然后把n右移一位

<!-- more -->

```python
class Solution(object):
    def hammingWeight(self, n):
        count = 0
        while n:
            count += n & 1
            n >>= 1
        return count
```

第二种方法：通过`n & (n - 1)`直接摘掉最后一位的1

```python
class Solution(object):
    def hammingWeight(self, n):
        count = 0
        while n:
            count += 1
            n = n & (n - 1)
        return count
```

## 231. 2的幂 Power of Two

[LeetCodeCN 第231题链接](https://leetcode-cn.com/problems/power-of-two/)

先排除负数和0，由于2的幂的二进制只有第一位是1，通过`n & (n - 1)`直接摘掉最后一位的1，如果摘掉后为0即符合条件

```python
class Solution(object):
    def isPowerOfTwo(self, n):
        return n > 0 and not n & (n - 1)
```

## 338. 比特位计数 Counting Bits

[LeetCodeCN 第338题链接](https://leetcode-cn.com/problems/counting-bits/)

第一种方法：遍历，每次分别计算一次比特位，时间复杂度为n乘以每个数的1位个数

```python
class Solution(object):
    def countBits(self, num):
        result = []
        for i in range(num+1):
            count = 0
            while i:
                count += 1
                i = i & (i - 1)
            result.append(count)
        return result
```

第二种方法：用一个递推式子`count[i] = count[i&(i-1)] + 1`，原理是`i&(i-1)`的1的个数总是比`i`少1，同时`i&(i-1)`这个数肯定比`i`小，所以预先是算过的，这样时间复杂度为`O(n)`

```python
class Solution(object):
    def countBits(self, num):
        result = [0] * (num+1)
        for i in range(1, num+1):
            result[i] = result[i&(i-1)] + 1
        return result
```
