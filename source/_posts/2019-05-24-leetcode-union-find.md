---
title: LeetCode做题笔记—并查集相关题目
date: 2019-05-24 09:34:02
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关并查集 Union Find Set 的做题笔记，Python实现

<!-- more -->

## 200. 岛屿的个数 Number of Islands

[LeetCodeCN 第200题链接](https://leetcode-cn.com/problems/number-of-islands/)

第一种方法：构造一个简单的并查集，将输入的二维数组坐标一维化。

实例化并查集对象后，遍历二维数组，发现为`1`时对该节点上下左右都执行一次`union()`，将这上下左右的`1` （如果是的话）的`parent`指向当前节点

```python
class UnionFind:
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
        if rootx != rooty:
            self.parent[rooty] = rootx
            self.count -= 1

class Solution:
    def numIslands(self, grid) -> int:
        if not grid:
            return 0
        uf = UnionFind(grid)
        directions = [(0,1), (0,-1), (-1,0), (1,0)]
        n, m = len(grid), len(grid[0])
        for i in range(n):
            for j in range(m):
                if grid[i][j] == '1':
                    for x, y in directions:
                        if 0 <= i+x < n and 0 <= j+y < m and grid[i+x][j+y] == '1':
                            uf.union(i*m+j, (i+x)*m+(j+y))
        return uf.count
```

第二种方法：染色解法，DFS深度优先搜索清除相邻岛屿，遍历二维数组，发现为`1`时岛屿数量加1，同时DFS将自身及周边相邻（上下左右）位置递归置`0`

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

第三种方法：染色解法，BFS广度优先搜索清除相邻岛屿，遍历二维数组，发现为`1`时岛屿数量加1，同时BFS将自身及周边相邻（上下左右）位置用队列逐个置`0`，把上面的DFS的递归改成BFS的队列即可

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

## 547. 朋友圈 Friend Circles

[LeetCodeCN 第547题](https://leetcode-cn.com/problems/friend-circles/)

第一种方法：构造一个简单的并查集，将输入的二维数组坐标一维化。

实例化并查集对象后，遍历二维数组，发现为`1`时对该节点上下左右都执行一次`union()`，将这上下左右的`1` （如果是的话）的`parent`指向当前节点

```python
class UnionFind:
    def __init__(self, M):
        self.n = len(M)
        self.parent = list(range(self.n))
    
    # 在查找的同时，也把节点换绑到根节点上了
    def find(self, i):
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, x, y):
        rootx = self.find(x)
        rooty = self.find(y)
        if rootx != rooty:
            self.parent[rooty] = rootx
            
    def diff_groups(self):
        diff_groups = set()
        for i in range(self.n):
            diff_groups.add(self.find(i))
        return len(diff_groups)

class Solution:
    def findCircleNum(self, M) -> int:
        uf = UnionFind(M)
        for i in range(len(M)):
            for j in range(len(M)):
                if M[i][j]:
                    uf.union(i, j)
        return uf.diff_groups()
```

第二种方法：DFS， 首先我们进行情景转换，如果把每个同学看作一个城市，同学与同学之间的朋友关系表示两个城市之间存在公路（可互相到达）。那么朋友圈的个数就转换为城市圈的个数。我们每次从整个城市集合中挑选出一个未访问的城市，接着我们访问它所能到达的所有城市（递归，深度优先搜索）。那么我们挑选了几次就是访问到了多少个城市圈。

```python
class Solution:
    def findCircleNum(self, M: List[List[int]]) -> int:
        if not M:
            return 0
        self.M, self.n, self.visited, count = M, len(M), set(), 0
        for i in range(self.n):
                if i not in self.visited:
                    count += 1
                    self.dfs(i)
        return count
                    
    def dfs(self, i):
        for j in range(self.n):
            if self.M[i][j] == 1 and j not in self.visited:
                self.visited.add(j)
                self.dfs(j)
```

第三种方法：BFS，把上面的DFS的递归写法改成BFS的队列即可

```python
from collections import deque
class Solution:
    def findCircleNum(self, M: List[List[int]]) -> int:
        if not M:
            return 0
        n, visited, count, queue = len(M), set(), 0, deque()
        for i in range(n):
            if i not in visited:
                count += 1
                queue.append(i)
                while queue:
                    p = queue.popleft()
                    visited.add(p)
                    for j in range(n):
                        if M[p][j] == 1 and j not in visited:
                            queue.append(j)
        return count
```