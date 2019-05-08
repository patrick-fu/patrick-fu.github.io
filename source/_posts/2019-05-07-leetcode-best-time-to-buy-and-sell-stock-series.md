---
title: LeetCode做题笔记—买卖股票的最佳时机系列题目
date: 2019-05-07 21:34:40
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关买卖股票最佳时机系列做题笔记，Python实现

## 122. 买卖股票的最佳时机 II Best Time to Buy and Sell Stock II

[LeetCodeCN 第122题链接](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-ii/)

第一种方法：深度优先搜索，时间复杂度`O(2^n)`

第二种方法：贪心算法，一次遍历，只要今天价格小于明天价格就在今天买入然后明天卖出，时间复杂度`O(n)`

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        ans = 0
        for i in range(1, len(prices)):
            if prices[i] > prices[i-1]:
                ans += prices[i] - prices[i-1]
        return ans
```