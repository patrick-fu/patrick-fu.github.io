---
title: LeetCode做题笔记—DP动态规划相关题目
date: 2019-05-15 11:13:52
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关动态规划 Dynamic Programming 的做题笔记，Python实现

<!-- more -->

## 70. 爬楼梯 Climbing Stairs

[LeetCodeCN 第70题链接](https://leetcode-cn.com/problems/climbing-stairs/)

第一种方法：递归，显然是个斐波那契数列，时间复杂度 $O(2^n)$很高，这样没法通过LeetCode，参考 @wikizero 的解法可以加个LRU缓存

```python
# from functools import lru_cache
class Solution:        
    # @lru_cache(10**8)
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        return self.climbStairs(n - 1) + self.climbStairs(n - 2)
```

第二种方法：动态规划，用数组记录每个台阶的所有走法个数，时间复杂度降为 $O(n)$

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        f = [0] * (n+1)
        f[0] = f[1] = 1
        for i in range(2, n+1):
            f[i] = f[i-1] + f[i-2]
        return f[n]
```

第三种方法：动态规划，由于只需要返回最后一步的所有走法个数，不需要数组记录过程，利用Python的同时赋值特性，只需两个变量就行，空间复杂度降为 $O(1)$

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        x = y = 1
        for _ in range(1, n):
            x, y = x+y, x
        return x
```
## 120. 三角形最小路径和 Triangle

[LeetCodeCN 第120题链接](https://leetcode-cn.com/problems/triangle/)

第一种方法：递归，时间复杂度`O(2^n)`，LeetCode会超时过不了

```python
class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        self.tri = triangle
        self.path = []
        self.helper(0,0,0)
        return min(self.path)
        
    def helper(self, i, j, res):
        if i >= len(self.tri):
            self.path.append(res)
            return
        res += self.tri[i][j]
        self.helper(i+1, j, res)
        self.helper(i+1, j+1, res)
```

第二种方法：动态规划，新建个二维数组`mini`，定义`mini[i][j]`为从三角形底部到`[i][j]`的最小路径和，递推公式`mini[i][j] = triangle[i][j] + min(mini[i+1][j], mini[i+1][j+1])`即本身节点的值加上下一层`[i+1]`里相邻两个节点`mini`的最小值，首先把三角形最后一层赋值给`mini`的最后一层，然后两个循环，最后得到`mini[0][0]`三角形顶部节点，时间复杂度`O(n^2)`

```python
class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        lens = len(triangle)
        mini = [[0]*lens for _ in range(lens)]
        mini[lens-1] = triangle[lens-1]
        for i in range(lens-2, -1, -1):
            for j in range(len(triangle[i])):
                mini[i][j] = triangle[i][j] + min(mini[i+1][j], mini[i+1][j+1])
        return mini[0][0]
```

第三种方法：在第二种方法的基础上，`mini`只需一维数组即可，更新自身

```python
class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        mini = triangle[len(triangle)-1]
        for i in range(len(triangle)-2, -1, -1):
            for j in range(len(triangle[i])):
                mini[j] = triangle[i][j] + min(mini[j], mini[j+1])
        return mini[0]
```

第四种方法：在第二种方法的基础上，直接修改三角形数组的值，空间复杂度为`O(1)`

```python
class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        for i in range(len(triangle)-2, -1, -1):
            for j in range(len(triangle[i])):
                triangle[i][j] += min(triangle[i+1][j], triangle[i+1][j+1])
        return triangle[0][0]
```

## 152. 乘积最大子序列 Maximum Product Subarray

[LeetCodeCN 第152题链接](https://leetcode-cn.com/problems/maximum-product-subarray/)

第一种方法：DP动态规划，创建二维数组`dp`，`dp[i][0]`存放正数最大值, `dp[i][1]`存放最小值即负数的最大值

```python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        if nums is None:
            return 0
        dp = [[0]*2 for _ in range(len(nums))]
        dp[0][0], dp[0][1] = nums[0], nums[0]
        for i in range(1, len(nums)):
            dp[i][0] = max(dp[i-1][0]*nums[i], dp[i-1][1]*nums[i], nums[i])
            dp[i][1] = min(dp[i-1][0]*nums[i], dp[i-1][1]*nums[i], nums[i])
        result = []
        for j in dp:
            result.append(j[0])
        return max(result)
```

第二种方法：在第一种方法的基础上，用一维滚动数组`dp`，每次循环交替x和y为0和1

```python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        if nums is None:
            return 0
        dp = [[0]*2 for _ in range(2)]
        dp[0][0], dp[0][1], res = nums[0], nums[0], nums[0]
        for i in range(1, len(nums)):
            x, y = i & 1, (i - 1) & 1
            dp[x][0] = max(dp[y][0]*nums[i], dp[y][1]*nums[i], nums[i])
            dp[x][1] = min(dp[y][0]*nums[i], dp[y][1]*nums[i], nums[i])
            res = max(res, dp[x][0])
        return res
```

# 买卖股票最佳时机系列


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

<!-- more -->

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

## 309. 最佳买卖股票时机含冷冻期 Best Time to Buy and Sell Stock with Cooldown

[LeetCodeCN 第309题链接](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/)

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

## 300. 最长上升子序列 Longest Increasing Subsequence

[LeetCodeCN 第300题链接](https://leetcode-cn.com/problems/longest-increasing-subsequence/)

DP动态规划，定义状态`dp[i]`为以`nums[i]`为结尾且必须包含`nums[i]`本身的最长上升子序列的长度。两个嵌套的循环，状态转移方程`dp[i] = max(dp[i], dp[j] + 1)`即在内层循环内通过比较`dp[j]`来不断迭代`dp[i]`，找到前面最大的一个`dp`值然后加1。最后`dp`数组的最大值就是问题的解

```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        if not nums:
            return 0
        n = len(nums)
        dp = [1]*n
        for i in range(1, n):
            for j in range(i):
                if nums[i] > nums[j]:
                    dp[i] = max(dp[i], dp[j]+1)
        return max(dp)
```

## 322. 零钱兑换 Coin Change

[LeetCodeCN 第322题链接](https://leetcode-cn.com/problems/coin-change/)

第一种方法：DFS深度优先搜索，暴力操作，LeetCode会超时过不去
```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        if amount < 1:
            return 0 
        self.coins = sorted(coins, reverse=True)
        self.res = []
        for i in self.coins:
            self.dfs(amount, i, 1)
        if not self.res:
            return -1
        return min(self.res)
        
    def dfs(self, amount, num, count):
        last = amount - num
        if last < 0:
            return
        if not last:
            self.res.append(count)
            return
        for i in self.coins:
            self.dfs(last, i, count + 1)
```

第二种方法：DP动态规划，定义状态`dp[i]`为拼凑数额`i`最少所需的硬币数量

```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [amount+1]*(amount+1)
        dp[0] = 0
        for i in range(1, amount+1):
            for c in coins:
                if i - c >= 0:
                    dp[i] = min(dp[i], dp[i-c] + 1)
        return dp[amount] if dp[amount] <= amount else -1
```

第三种方法：把`coins`的循环放外层，减少循环次数及一次`if`判断

```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [0] + [amount+1]*amount
        for coin in coins:
            for i in range(coin, amount+1):
                dp[i] = min(dp[i], dp[i-coin]+1)
        return dp[-1] if dp[-1] != amount+1 else -1
```

## 42. 接雨水 Trapping Rain Water

[LeetCodeCN 第42题链接](https://leetcode-cn.com/problems/trapping-rain-water/)

第一种方法：DP动态规划，计算出每个点的左边界最大与右边界最大，最后减去自身高度

```python
class Solution:
    def trap(self, height: List[int]) -> int:
        if not height:
            return 0
        n, res = len(height), 0
        maxLeft, maxRight = [0]*n, [0]*n
        maxLeft[0] = height[0]
        maxRight[-1] = height[-1]
        for i in range(1, n):
            maxLeft[i] = max(height[i], maxLeft[i-1])
        for j in range(n-2, -1, -1):
            maxRight[j] = max(height[j], maxRight[j+1])
        for k in range(n):
            res += min(maxLeft[k], maxRight[k]) - height[k]
        return res
```

第二种方法：双指针，每次矮边向内推进，如果自身不是该边最大值证明有更大的边，就可以接雨水了，否则更新自己为该边最大值

```python
class Solution:
    def trap(self, height: List[int]) -> int:
        if not height:
            return 0
        l, r, left_max, right_max, res = 0, len(height)-1, height[0], height[-1], 0
        while l < r:
            if height[r] >= height[l]:
                if left_max > height[l]:
                    res += left_max - height[l]
                else:
                    left_max = height[l]
                l += 1
            else:
                if right_max > height[r]:
                    res += right_max - height[r]
                else:
                    right_max = height[r]
                r -= 1
        return res
                
```

## 62. 不同路径 Unique Paths

[LeetCodeCN 第62题链接](https://leetcode-cn.com/problems/unique-paths/)

标准的动态规划，从右下目标点往左上走，dp储存当前点位共有多少种走法，`dp[i][j]的走法数量 = dp[i+1][j] + dp[i][j+1]` 底边和最右边格子都是1，所以创建dp数组时顺便把初始化也完成了

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        if not m or not n:
            return 0
        dp = [[1]*m for _ in range(n)]
        for i in range(n-2, -1, -1):
            for j in range(m-2, -1, -1):
                dp[i][j] = dp[i+1][j] + dp[i][j+1]
        return dp[0][0]
```

## 63. 不同路径 II Unique Paths II

[LeetCodeCN 第63题链接](https://leetcode-cn.com/problems/unique-paths/)

```python
class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:
        if not obstacleGrid or not obstacleGrid[0]:
            return 0
        n, m = len(obstacleGrid), len(obstacleGrid[0])
        dp = [[1]*m for _ in range(n)]
        # 处理最右列的初始值
        flag = 0
        for i in range(n-1, -1, -1):
            if flag:
                dp[i][m-1] = 0
                continue
            if obstacleGrid[i][m-1]:
                dp[i][m-1] = 0
                flag = 1
        # 处理最下行的初始值
        flag = 0
        for i in range(m-1, -1, -1):
            if flag:
                dp[n-1][i] = 0
                continue
            if obstacleGrid[n-1][i]:
                dp[n-1][i] = 0
                flag = 1
        # 从右下到左上的DP递推
        for i in range(n-2, -1, -1):
            for j in range(m-2, -1, -1):
                if obstacleGrid[i][j]:
                    dp[i][j] = 0
                    continue
                dp[i][j] = dp[i+1][j] + dp[i][j+1]
        return dp[0][0]
```

## 64. 最小路径和 Minimum Path Sum

[LeetCodeCN 第64题链接](https://leetcode-cn.com/problems/minimum-path-sum/)

动态规划，定义DP二维数组储存的是经过该点位的最小路径和，首先初始化好最右边和底边的初始值，然后从目标右下递推到起始点左上，`dp[0][0]`即结果

```python
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        if not grid or not grid[0]:
            return 0
        n, m = len(grid), len(grid[0])
        dp = [[0]*m for _ in range(n)]
        dp[-1][-1] = grid[-1][-1]
        for i in range(n-2, -1, -1):
            dp[i][m-1] = grid[i][m-1] + dp[i+1][m-1]
        for i in range(m-2, -1, -1):
            dp[n-1][i] = grid[n-1][i] + dp[n-1][i+1]
        for i in range(n-2, -1, -1):
            for j in range(m-2, -1, -1):
                dp[i][j] = min(dp[i+1][j], dp[i][j+1]) + grid[i][j]
        return dp[0][0]
```

## 198. 打家劫舍 House Robber

[LeetCodeCN 第198题链接](https://leetcode-cn.com/problems/house-robber/)

第一种方法：动态规划，递推方程`f(i) = max(f(i-1), f(i-2)+nums[i])`，当前点位最大利润可能来自前一个点位的最大利润（当前点位不偷）或者来自前两个点位的最大利润加上偷当前点位。开一个长度为`n`的数组记录，取数组末尾即结果

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums:
            return 0
        n = len(nums)
        if n <= 2:
            return max(nums)
        dp = [0]*n
        dp[0], dp[1] = nums[0], max(nums[0], nums[1])
        for i in range(2, n):
            dp[i] = max(dp[i-1], dp[i-2]+nums[i])
        return dp[-1]
```

第二种方法：用滚动数组降低空间复杂度，`O(n)→O(1)`，无需改动太多代码，适合面试时改进代码

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums:
            return 0
        n = len(nums)
        if n <= 2:
            return max(nums)
        dp = [0]*2
        dp[0], dp[1] = nums[0], max(nums[0], nums[1])
        for i in range(2, n):
            x, y = i&1, (i+1)&1
            dp[x] = max(dp[y], dp[x]+nums[i])
        return max(dp[0], dp[1])
```