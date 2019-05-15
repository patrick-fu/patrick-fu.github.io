---
title: leetcode-union-find
date: 2019-05-16 09:34:02
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关并查集 Union Find Set 的做题笔记，Python实现

## 构造一个简单的并查集

针对下面两个问题都是二维数组，定制了并查集类

```python
class UnionFind(object):
    def __init__(self, grid):
        n, m = len(grid), len(grid[0])
        self.count = 0
        self.parent = [-1] * (n*m)
        # self.rank = [0] * (n*m)
        for i in range(n):
            for j in range(m):
                if grid[i][j] == '1':
                    self.parent[i*m + j] = i*m + j
                    self.count += 1
    
    # 在查找的同时，也把节点换绑到根节点上了
    def find(self, i):
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, x, y):
        rootx = self.find(x)
        rooty = self.find(y)
        self.parent[rooty] = rootx
        self.count -= 1
```

## 200. 岛屿的个数 Number of Islands

[LeetCodeCN 第200题链接](https://leetcode-cn.com/problems/number-of-islands/)

第一种方法：染色解法，DFS深度优先搜索清除相邻岛屿，遍历二维数组，发现为`1`时岛屿数量加1，同时DFS将自身及周边相邻（上下左右）位置递归置`0`

<!-- more -->

```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        if not grid:
            return 0
        self.grid, count = grid, 0
        self.n, self.m = len(grid), len(grid[0])
        for i in range(self.n):
            for j in range(self.m):
                if grid[i][j] == '1':
                    count += 1
                    self.dfs(i, j)
        return count
    
    def dfs(self, i, j):
        if 0 <= i < self.n and 0 <= j < self.m and self.grid[i][j] == '1':
            self.grid[i][j] = '0'
            self.dfs(i-1, j)
            self.dfs(i+1, j)
            self.dfs(i, j-1)
            self.dfs(i, j+1)
```

第二种方法：染色解法，BFS广度优先搜索清除相邻岛屿，遍历二维数组，发现为`1`时岛屿数量加1，同时BFS将自身及周边相邻（上下左右）位置用队列逐个置`0`

```python
from collections import deque
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        if not grid:
            return 0
        self.grid, count = grid, 0
        self.n, self.m = len(grid), len(grid[0])
        for i in range(self.n):
            for j in range(self.m):
                if grid[i][j] == '1':
                    count += 1
                    self.bfs(i, j)
        return count
                    
    def bfs(self, i, j):
        queue = deque()
        queue.append((i, j))
        while queue:
            i, j = queue.popleft()
            if 0 <= i < self.n and 0 <= j < self.m and self.grid[i][j] == '1':
                self.grid[i][j] = '0'
                queue.append((i-1, j))
                queue.append((i+1, j))
                queue.append((i, j-1))
                queue.append((i, j+1))
```