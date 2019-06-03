---
title: LeetCode做题笔记—买卖股票的最佳时机系列题目
date: 2019-05-18 21:34:40
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

这是一套经典的动态规划题目，题目主干都是给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格，在不同的情况下求在什么时候买卖以获取最大利润。

<!-- more -->

- 121题是只能买卖一次的情况下求最大利润；
- 122题可以买卖任意多次；
- 123题可以买卖两次；
- 188题是前面三题的泛化版本，给定参数k，求买卖k次情况下的最大利润；
- 309题是在122题买卖任意多次的基础上加上冷冻期即T+1才能卖出。

其中买卖k次的188题是标准的三维动态规划题，用解这题的通用方可以稍加改造就能解决前三题，当然前三题也有单独的特定简单解法，这里为了练习还是重点看动态规划的解决方法。

在188题的基础上可以再变形出更多题目，比如现在这些题都是最多只能持有1股，如果可以持有n股（每天只能买入或卖出1股），也能用这个188题的三维DP通解来解决。

## 121. 买卖股票的最佳时机 Best Time to Buy and Sell Stock

[LeetCodeCN 第121题链接](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/)

给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格。

如果你最多只允许完成一笔交易（即买入和卖出一支股票），设计一个算法来计算你所能获取的最大利润。

注意你不能在买入股票前卖出股票。

#### 示例 1:
```
输入: [7,1,5,3,6,4]
输出: 5
解释: 在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
     注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格。
```
#### 示例 2:
```
输入: [7,6,4,3,1]
输出: 0
解释: 在这种情况下, 没有交易完成, 所以最大利润为 0。
```

### 解：

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

给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你可以尽可能地完成更多的交易（多次买卖一支股票）。

注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

#### 示例 1:
```
输入: [7,1,5,3,6,4]
输出: 7
解释: 在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。
     随后，在第 4 天（股票价格 = 3）的时候买入，在第 5 天（股票价格 = 6）的时候卖出, 这笔交易所能获得利润 = 6-3 = 3 。
```
#### 示例 2:
```
输入: [1,2,3,4,5]
输出: 4
解释: 在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。
     注意你不能在第 1 天和第 2 天接连购买股票，之后再将它们卖出。
     因为这样属于同时参与了多笔交易，你必须在再次购买前出售掉之前的股票。
```
#### 示例 3:
```
输入: [7,6,4,3,1]
输出: 0
解释: 在这种情况下, 没有交易完成, 所以最大利润为 0。
```
### 解：

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

[LeetCodeCN 第123题链接](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-iii/)

给定一个数组，它的第 i 个元素是一支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 两笔 交易。

注意: 你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

#### 示例 1:
```
输入: [3,3,5,0,0,3,1,4]
输出: 6
解释: 在第 4 天（股票价格 = 0）的时候买入，在第 6 天（股票价格 = 3）的时候卖出，这笔交易所能获得利润 = 3-0 = 3 。
     随后，在第 7 天（股票价格 = 1）的时候买入，在第 8 天 （股票价格 = 4）的时候卖出，这笔交易所能获得利润 = 4-1 = 3 。
```
#### 示例 2:
```
输入: [1,2,3,4,5]
输出: 4
解释: 在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。   
     注意你不能在第 1 天和第 2 天接连购买股票，之后再将它们卖出。   
     因为这样属于同时参与了多笔交易，你必须在再次购买前出售掉之前的股票。
```
#### 示例 3:
```
输入: [7,6,4,3,1] 
输出: 0 
解释: 在这个情况下, 没有交易完成, 所以最大利润为 0。
```

第一种方法：标准的三维DP动态规划，三个维度，第一维表示天，第二维表示交易了几次，第三维表示是否持有股票。与下面188题买卖股票4一样的代码，把交易k次定义为2次。当然也可以把内层的for循环拆出来，分别列出交易0次、1次、2次的状态转移方程即可

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

[LeetCodeCN 第188题链接](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-iv/)

给定一个数组，它的第 i 个元素是一支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 k 笔交易。

注意: 你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

#### 示例 1:
```
输入: [2,4,1], k = 2
输出: 2
解释: 在第 1 天 (股票价格 = 2) 的时候买入，在第 2 天 (股票价格 = 4) 的时候卖出，这笔交易所能获得利润 = 4-2 = 2 。
```
#### 示例 2:
```
输入: [3,2,6,5,0,3], k = 2
输出: 7
解释: 在第 2 天 (股票价格 = 2) 的时候买入，在第 3 天 (股票价格 = 6) 的时候卖出, 这笔交易所能获得利润 = 6-2 = 4 。
     随后，在第 5 天 (股票价格 = 0) 的时候买入，在第 6 天 (股票价格 = 3) 的时候卖出, 这笔交易所能获得利润 = 3-0 = 3 。
```

### 解：

标准的三维DP动态规划，三个维度，第一维表示天，第二维表示交易了几次，第三维表示是否持有股票。

首先初始化三维数组，填充第1天操作j次的没买或买了的情况的初始值，没买就是`0`，第一天就买入即`-prices[0]`。这里定义卖出操作时交易次数加`1`

然后是状态转移方程，下面描述的`i, j`都大于`0`

「第`i`天交易次数`0`不持有股票」的情况只能来自「第`i-1`天交易次数`0`不持有股票」；

「第`i`天交易`j`次不持有股票」的状态可以来自「第`i-1`天交易`j`次不持有股票」或者「第`i-1`天交易`j-1`次持有股票」(即今天卖出股票，然后交易次数+1)；

「第`i`天交易`j`次持有股票」的状态可以来自「第`i-1`天交易`j`次持有股票」或者「第`i-1`天交易`j`次不持有股票」(即今天买入股票，因为是买入操作所以交易次数不变)

最后对于这题LeetCode的测试样例里有超大k值的情况，退化成122题不限次数的操作，可以用贪心解决或者直接替换k值为数组长度的一半

```python
class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        if not prices or not k:
            return 0
        n = len(prices)
        
        # 当k大于数组长度的一半时，等同于不限次数交易即122题，用贪心算法解决，否则LeetCode会超时，也可以直接把超大的k替换为数组的一半，就不用写额外的贪心算法函数
        if k > n//2:
            return self.greedy(prices)
        
        dp, res = [[[0]*2 for _ in range(k+1)] for _ in range(n)], []
        # dp[i][k][0]表示第i天已交易k次时不持有股票 dp[i][k][1]表示第i天已交易k次时持有股票
        # 设定在卖出时加1次交易次数
        for i in range(k+1):
            dp[0][i][0], dp[0][i][1] = 0, - prices[0]
        for i in range(1, n):
            for j in range(k+1):
                if not j:
                    dp[i][j][0] = dp[i-1][j][0]
                else:
                    dp[i][j][0] = max(dp[i-1][j][0], dp[i-1][j-1][1] + prices[i])
                dp[i][j][1] = max(dp[i-1][j][1], dp[i-1][j][0] - prices[i])
        # 「所有交易次数最后一天不持有股票」的集合的最大值即为问题的解
        for m in range(k+1):
            res.append(dp[n-1][m][0])
        return max(res)
    
    # 处理k过大导致超时的问题，用贪心解决
    def greedy(self, prices):
        res = 0
        for i in range(1, len(prices)):
            if prices[i] > prices[i-1]:
                res += prices[i] - prices[i-1]
        return res
```

> 一个技巧：之前为了降低空间复杂度，需要改动很多代码来把DP数组降维（比如下面题目的方法二），其实可以在标准的DP解法基础上，把时间（天数）的维度稍加改动，用滚动数组，两个元素即可代替n个元素，有效降低空间复杂度，比如这题原本三维DP数组的空间复杂度是O(n×k×2)即O(n*k),用上滚动数组后就降为O(k×2)即O(k),性能提升比较显著。

> 滚动数组即用两个值 x, y, 在迭代 n 的时候, 赋值为 i&1, (i-1)&1, 利用位运算效果等同于 i%2, 即奇偶判断取1或0, 如此实现 x, y 交替0和1。需要注意一下迭代的起始值是1还是0。下面代码是对上面代码稍加改动的实现。

```python
class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        if not prices or not k:
            return 0
        n = len(prices)
        
        # 当k大于数组长度的一半时，等同于不限次数交易即122题，用贪心算法解决，否则LeetCode会超时，也可以直接把超大的k替换为数组的一半，就不用写额外的贪心算法函数
        if k > n//2:
            return self.greedy(prices)
        
        dp, res = [[[0]*2 for _ in range(k+1)] for _ in range(2)], []
        # dp[i][k][0]表示第i天已交易k次时不持有股票 dp[i][k][1]表示第i天已交易k次时持有股票
        # 设定在卖出时加1次交易次数
        for i in range(k+1):
            dp[0][i][0], dp[0][i][1] = 0, - prices[0]
        for i in range(1, n):
            x, y = i&1, (i-1)&1
            # 对 i 与 i-1 取奇偶, 令 x,y 交替 0和1, 实现滚动数组
            # 可以减少一维DP数组, 降低空间复杂度
            for j in range(k+1):
                if not j:
                    dp[x][j][0] = dp[y][j][0]
                else:
                    dp[x][j][0] = max(dp[y][j][0], dp[y][j-1][1] + prices[i])
                dp[x][j][1] = max(dp[y][j][1], dp[y][j][0] - prices[i])
        # 「所有交易次数最后一天不持有股票」的集合的最大值即为问题的解
        for m in range(k+1):
            res.append(dp[0][m][0])
            res.append(dp[1][m][0])
            # 这里因为前面用了滚动数组
            # 不知道最后一天的值在哪里
            # 所以都加进去然后取最大值
        return max(res)
    
    # 处理k过大导致超时的问题，用贪心解决
    def greedy(self, prices):
        res = 0
        for i in range(1, len(prices)):
            if prices[i] > prices[i-1]:
                res += prices[i] - prices[i-1]
        return res
```

## 309. 最佳买卖股票时机含冷冻期 Best Time to Buy and Sell Stock with Cooldown

[LeetCodeCN 第309题链接](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/)

给定一个整数数组，其中第 i 个元素代表了第 i 天的股票价格 。​

设计一个算法计算出最大利润。在满足以下约束条件下，你可以尽可能地完成更多的交易（多次买卖一支股票）:

你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。
卖出股票后，你无法在第二天买入股票 (即冷冻期为 1 天)。

#### 示例:
```
输入: [1,2,3,0,2]
输出: 3 
解释: 对应的交易状态为: [买入, 卖出, 冷冻期, 买入, 卖出]
```

### 解：

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
