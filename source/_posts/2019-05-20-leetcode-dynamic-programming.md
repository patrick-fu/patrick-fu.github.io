---
title: LeetCode做题笔记—DP动态规划相关题目
date: 2019-05-20 11:13:52
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

## 72. 编辑距离 Edit Distance

[LeetCodeCN 第72题链接](https://leetcode-cn.com/problems/edit-distance/)

第一种方法：BFS暴力求解

第二种方法：DP动态规划，定义状态`dp[i][j]` 表示`word1`的前`i`个字母和`word2`的前`j`个字母之间的编辑距离，即`word1`的前`i`个字符要替换到`word2`的前`j`个字符所需要的最少操作次数。当`word1[i-1] == word2[j-1]`时，`dp[i][j]`的状态就是直接转移`dp[i-1][j-1]`，无需任何步骤，否则，`dp[i][j]`的状态来自`dp[i-1][j], dp[i][j-1], dp[i-1][j-1]`（添加、删除、替换）中的最小值并加操作步骤`1`次。

```python
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        n, m = len(word1), len(word2)
        dp = [[0]*(m+1) for _ in range(n+1)]
        
        for i in range(n+1):
            dp[i][0] = i
        for j in range(m+1):
            dp[0][j] = j
        
        for i in range(1,n+1):
            for j in range(1,m+1):
                if word1[i-1] == word2[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1
                # 上面的if else逻辑可以压缩成一行
                # dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(0 if word1[i-1] == word2[j-1] else 1))
        return dp[n][m]
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

[LeetCodeCN 第63题链接](https://leetcode-cn.com/problems/unique-paths-ii/)

与上题62题思路一样，从右下目标点往左上走，dp储存当前点位共有多少种走法，`dp[i][j]的走法数量 = dp[i+1][j] + dp[i][j+1]`，不过因为有障碍物需要额外处理一下，分别初始化底边和最右边。然后迭代时判断一下障碍物即可

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

用滚动数组降低空间复杂度，从左上角往右下角迭代

```python
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        if not grid or not grid[0]:
            return 0
        m, n = len(grid), len(grid[0])
        dp = [[0]*n for _ in range(2)]
        dp[0][0] = grid[0][0]

        for i in range(1, n):
            dp[0][i] = dp[0][i-1] + grid[0][i]
            
        for i in range(1, m):
            x, y = i&1, (i-1)&1
            for j in range(n):
                if not j:
                    dp[x][j] = dp[y][j] + grid[i][j]
                else:
                    dp[x][j] = min(dp[y][j], dp[x][j-1]) + grid[i][j]
        return dp[0][-1] if m&1 else dp[1][-1]

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

## 5. 最长回文子串 Longest Palindromic Substring

[LeetCodeCN 第5题链接](https://leetcode-cn.com/problems/longest-palindromic-substring/)

第一种方法：动态规划，定义`dp[i][j]`为从位置`j`到`i`的字符串是否是回文串，递推式子是`if (s[i] == s[j] and dp[i-1][j+1]) then dp[i][j] = 1`其中加入一个判断如果子串长度为2就不用看`dp`了加速计算。然后如果`dp[i][j]`是回文串了，就跟当前最长的回文串比较，如果新的更长就更新结果

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ''
        n = len(s)
        maxLen, res, dp = 0, '', [[0]*n for _ in range(n)]
        for i in range(n):
            for j in range(i, -1, -1):
                if s[i] == s[j] and (i-j<2 or dp[i-1][j+1]):
                    dp[i][j] = 1
                if dp[i][j] and maxLen < i-j+1:
                    maxLen = i-j+1
                    res = s[j:i+1]
        return res
```

---

## [动态规划——买卖股票最佳时机系列题链接](https://paaatrick.com/2019-05-18-leetcode-best-time-to-buy-and-sell-stock-series/)

---