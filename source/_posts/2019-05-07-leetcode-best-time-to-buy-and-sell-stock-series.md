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

<!-- more -->

## 121. 买卖股票的最佳时机 Best Time to Buy and Sell Stock

[LeetCodeCN 第121题链接](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/)

第一种方法：由于一次交易操作，可以通过记录最小价格，计算最大利润的方式，空间换时间，时间复杂度`O(n)`

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        res, low = 0, float('inf')
        for i in range(len(prices)):
            low = min(prices[i], low)
            res = max(res, prices[i] - low)
        return res
```

第二种方法：DP动态规划，与下面122题相比，由于只能一次交易操作，第`i`天的状态就不止“不持有”和“持有”两种状态，而是“未持有”、“持有”、“卖出”三种，并需要一个变量存储最大值

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        # 生成数组, 然后给初始状态赋值
        dp, res = [[0]*3 for _ in range(len(prices))], 0
        dp[0][0], dp[0][1], dp[0][2] = 0, -prices[0], 0
        for i in range(1, len(prices)):
            # dp[i][0] 第i天 一直没有股票的利润
            # dp[i][1] 第i天 当前有股票的利润 取 max(前面有股票今天不卖, 前面没股票今天买入)
            # dp[i][2] 第i天 之前买入现在卖了的利润(前面有股票今天卖出)
            dp[i][0] = dp[i-1][0]
            dp[i][1] = max(dp[i-1][0] - prices[i], dp[i-1][1])
            dp[i][2] = dp[i-1][1] + prices[i]
            res = max(res, dp[i][0], dp[i][2])
        return res
```

## 122. 买卖股票的最佳时机 II Best Time to Buy and Sell Stock II

[LeetCodeCN 第122题链接](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-ii/)

第一种方法：深度优先搜索，时间复杂度`O(2^n)`，这个通过不了LeetCode，不过能work，测试了多组测试样例是正确的

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        self.prices = prices
        self.profit = []
        self.helper(0, 0, 0)
        return max(self.profit)
        
    # have 0:未持有  1:持有
    def helper(self, i, have, profit):
        if i == len(self.prices):
            self.profit.append(profit)
            return
        if have: # 如果持有中
            self.helper(i+1, 0, profit + self.prices[i]) # 卖出
            self.helper(i+1, 1, profit) # 不动
        else: # 如果未持有
            self.helper(i+1, 0, profit) # 不动
            self.helper(i+1, 1, profit - self.prices[i]) # 买入
```

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

第三种方法：标准二维DP动态规划，第`i`天只有两种状态，不持有或持有股票，当天不持有股票的状态可能来自昨天卖出或者昨天也不持有，同理，当天持有股票的状态可能来自昨天买入或者昨天也持有中，取最后一天的不持有股票状态就是问题的解

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        n = len(prices)
        dp = [[0]*2 for _ in range(n)]
        # dp[i][0]表示第i天不持有股票, dp[i][1]表示第i天持有股票
        dp[0][0], dp[0][1] = 0, - prices[0]
        for i in range(1, n):
            dp[i][0] = max(dp[i-1][0], dp[i-1][1] + prices[i])
            dp[i][1] = max(dp[i-1][1], dp[i-1][0] - prices[i])
        return dp[n-1][0]
```

## 123.  买卖股票的最佳时机 III Best Time to Buy and Sell Stock III

第一种方法：标准的三维DP动态规划，与下面188题买卖股票4一样的代码，把交易k次改为2次

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        n = len(prices)
        dp = [[[0]*2 for _ in range(3)] for _ in range(n)]
        # dp[i][j][0]表示第i天交易了j次时不持有股票, dp[i][j][1]表示第i天交易了j次时持有股票
        # 定义卖出股票时交易次数加1
        for i in range(3):
            dp[0][i][0], dp[0][i][1] = 0, -prices[0]
        
        for i in range(1, n):
            for j in range(3):
                if not j:
                    dp[i][j][0] = dp[i-1][j][0]
                else:
                    dp[i][j][0] = max(dp[i-1][j][0], dp[i-1][j-1][1] + prices[i])
                dp[i][j][1] = max(dp[i-1][j][1], dp[i-1][j][0] - prices[i])
        
        return max(dp[n-1][0][0], dp[n-1][1][0], dp[n-1][2][0])
```

第二种方法：用变量而不是多维数组保存迭代的值，优点是省内存空间，缺点是不是标准DP，没法泛化

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        
        buy1, sell1, buy2, sell2 = -prices[0], 0, -prices[0], 0
        for i in range(1,len(prices)):
            buy1 = max(buy1,-prices[i])	#用负值统一变量
            sell1 = max(sell1,buy1 + prices[i])	#sell1为 0~i(含)天股市中买卖一次的最优利润
            buy2 = max(buy2,sell1 - prices[i])	#仅当＞0才会更新，保证 第二次买入不会与第一次卖出为同一天。而sell1为历史记录保证第二次买入比第一次卖出晚。
            sell2 = max(sell2,buy2 + prices[i])	#若第二轮买卖为同一天，则不会更新。此操作自然保证sell2为买卖至多两次的最优利润。
        return sell2
```

## 188. 买卖股票的最佳时机 IV Best Time to Buy and Sell Stock IV

DP动态规划，

```python
class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        if not prices or not k:
            return 0
        n = len(prices)
        
        # 当k大于数组长度的一半时，等同于不限次数交易即122题，用贪心算法解决，否则LeetCode会超时
        if k > n//2:
            return self.greedy(prices)
        
        dp, res = [[[0]*2 for _ in range(k+1)] for _ in range(n)], []
        # dp[i][k][0]表示第i天已交易k次时不持有股票 dp[i][k][1]表示第i天已交易k次时持有股票
        # 设定在卖出时加1次交易次数
        for i in range(k+1):
            dp[0][i][0], dp[0][i][1] = 0, - prices[0]
        for i in range(1, n):
            for j in range(k+1):
                if j == k:
                    dp[i][j][0] = dp[i-1][j][0]
                else:
                    dp[i][j][0] = max(dp[i-1][j][0], dp[i-1][j-1][1] + prices[i])
                dp[i][j][1] = max(dp[i-1][j][1], dp[i-1][j][0] - prices[i])
        for m in range(k+1):
            res.append(dp[n-1][m][0])
        return max(res)
    
    def greedy(self, prices):
        res = 0
        for i in range(1, len(prices)):
            if prices[i] > prices[i-1]:
                res += prices[i] - prices[i-1]
        return res
```

## 309. 最佳买卖股票时机含冷冻期 Best Time to Buy and Sell Stock with Cooldown

第一种方法：标准DP动态规划，三个维度，第一维表示天，第二维表示是否处于冷冻期，第三维表示是否持有股票

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        n = len(prices)
        dp = [[[0]*2 for _ in range(2)] for _ in range(n)]
        # dp[i][0][0]第一维表示第i天, 第二维用0,1表示是否处于冷冻期, 第三维用0,1表示是否持有股票
        dp[0][0][0], dp[0][0][1], dp[0][1][0] = 0, -prices[0], 0
        for i in range(1, n):
            dp[i][0][0] = max(dp[i-1][1][0], dp[i-1][0][0])
            dp[i][1][0] = dp[i-1][0][1] + prices[i]
            dp[i][0][1] = max(dp[i-1][0][1], dp[i-1][0][0] - prices[i])
        return max(dp[n-1][0][0], dp[n-1][1][0])
```

第二种方法：优化版的动态规划，用两个维度处理，第一维表示天，第二维用0表示未持有，1表示持有股票中，2表示处于冷冻期

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        n = len(prices)
        dp = [[0]*3 for _ in range(n)]
        # dp[i][0]表示第i天未持有, dp[i][1]表示持有股票, dp[i][2]表示前一天刚卖出今天处于冷冻期
        dp[0][0], dp[0][1], dp[0][2] = 0, -prices[0], 0
        for i in range(1, n):
            dp[i][0] = max(dp[i-1][0], dp[i-1][2])
            dp[i][1] = max(dp[i-1][1], dp[i-1][0] - prices[i])
            dp[i][2] = dp[i-1][1] + prices[i]
        return max(dp[n-1][0], dp[n-1][2])
```


