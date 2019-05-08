---
title: leetcode-bfs-dfs
date: 2019-05-08 12:02:49
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关BFS（广度优先）与DFS（深度优先）的做题笔记，Python实现

## 二叉树的定义
```python
# Definition for a binary tree node.
class TreeNode:
    def __init__(self, x):
        self.val = x
        self.left = None
        self.right = None
```

## 102. 二叉树的层次遍历 Binary Tree Level Order Traversal

[LeetCodeCN 第102题链接](https://leetcode-cn.com/problems/binary-tree-level-order-traversal/)

第一种方法：BFS广度优先搜索，使用双端队列deque（因为性能比另外两种Queue好得多），在大循环内对二叉树的每个层做一次遍历，注意`range(len(queue))`使只遍历当前的层。由于每个节点仅访问一次，所以时间复杂度`O(n)`

<!-- more -->

```python
import collections
class Solution:
    def levelOrder(self, root: TreeNode) -> List[List[int]]:
        if not root:
            return []
        result = []
        queue = collections.deque()
        queue.append(root)
        
        # 如果不是树而是图的话要记录一下访问过的节点，避免重复访问
        # visited = set(root)
        
        while queue:
            level_size = len(queue)
            current_level = []
            for _ in range(level_size):
                node = queue.popleft()
                current_level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            result.append(current_level)
        return result
```

第二种方法：DFS深度优先搜索，利用递归的栈，借助`level`记号把节点放入对应层，由于每个节点仅访问一次，所以时间复杂度`O(n)`

```python
class Solution:
    def levelOrder(self, root: TreeNode) -> List[List[int]]:
        if not root:
            return []
        self.result = []
        self._dfs(root, 0)
        return self.result
        
    def _dfs(self, node, level):
        if not node:
            return
        if len(self.result) < level + 1:
            self.result.append([])
        self.result[level].append(node.val)
        self._dfs(node.left, level + 1)
        self._dfs(node.right, level + 1)
```

## 104. 二叉树的最大深度 Maximum Depth of Binary Tree

第一种方法：BFS广度优先搜索，使用双端队列deque（因为性能比另外两种Queue好得多），在大循环内对二叉树的每个层做一次遍历，`range(len(queue))`使只遍历当前的层，每次大循环`ans`加1。由于每个节点仅访问一次，所以时间复杂度`O(n)`
```python
import collections
class Solution:
    def maxDepth(self, root: TreeNode) -> int:
        if not root:
            return 0
        queue = collections.deque()
        queue.append(root)
        ans = 0
        while queue:
            ans += 1
            for _ in range(len(queue)):
                node = queue.popleft()
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
        return ans
```

第二种方法：DFS深度优先搜索，利用递归的栈，借助`level`标记当前层，由于每个节点仅访问一次，所以时间复杂度`O(n)`

```python
class Solution:
    def maxDepth(self, root: TreeNode) -> int:
        if not root:
            return 0
        self.ans = 0
        self._dfs(root, 0)
        return self.ans
        
    def _dfs(self, node, level):
        if not node:
            return
        if self.ans < level + 1:
            self.ans = level + 1
        self._dfs(node.left, level + 1)
        self._dfs(node.right, level + 1)
```

第三种方法：DFS+分治，虽然代码简洁但耗时比上面两种方法都久

```python
class Solution:
    def maxDepth(self, root: TreeNode) -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
```

## 111. 二叉树的最小深度 Minimum Depth of Binary Tree

第一种方法：BFS广度优先搜索，使用双端队列deque（因为性能比另外两种Queue好得多），在大循环内对二叉树的每个层做一次遍历，`range(len(queue))`使只遍历当前的层。由于每个节点仅访问一次，所以时间复杂度`O(n)`

```python
import collections
class Solution:
    def minDepth(self, root: TreeNode) -> int:
        if not root:
            return 0
        ans = 0
        queue = collections.deque()
        queue.append(root)
        while queue:
            ans += 1
            for _ in range(len(queue)):
                node = queue.popleft()
                if node.left is None and node.right is None:
                    return ans
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
```

第二种方法：DFS深度优先搜索，利用递归的栈，借助`level`标记当前层，由于每个节点仅访问一次，所以时间复杂度`O(n)`

```python
class Solution:
    def minDepth(self, root: TreeNode) -> int:
        if not root:
            return 0
        self.ans = float('inf')
        self._dfs(root, 0)
        return self.ans
        
        
    def _dfs(self, node, level):
        if not node:
            return
        if node.left is None and node.right is None:
            if self.ans > level + 1:
                self.ans = level + 1
            return
        self._dfs(node.left, level + 1)
        self._dfs(node.right, level + 1)
```