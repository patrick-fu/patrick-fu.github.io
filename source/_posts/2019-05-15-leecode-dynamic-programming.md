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
        one = two = 1
        for _ in range(1, n):
            one, two = one + two, one
        return one
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