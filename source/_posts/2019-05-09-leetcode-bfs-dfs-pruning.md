---
title: LeetCode做题笔记—广度优先搜索、深度优先搜索、剪枝相关题目
date: 2019-05-09 12:02:49
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关BFS（广度优先搜索）与DFS（深度优先搜索）的做题笔记，Python实现

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

[LeetCodeCN 第104题链接](https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/)

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

[LeetCodeCN 第111题链接](https://leetcode-cn.com/problems/minimum-depth-of-binary-tree/)

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

## 22. 括号生成 Generate Parentheses

[LeetCodeCN 第22题链接](https://leetcode-cn.com/problems/generate-parentheses/)

DFS+剪枝，利用左括号与右括号分别已用的参数，当两个参数都为`n`时即填完一个结果添加进结果数组，精髓在于`if left_used > right_used`，只有在右括号少于左括号时才能填充右括号，保证输出的结果是合法的

```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        self.ans = []
        self.helper(0, 0, n, '')
        return self.ans
        
    def helper(self, left_used: int, right_used: int, n: int, result: str):
        if left_used == n and right_used == n:
            self.ans.append(result)
            return
        if left_used < n:
            self.helper(left_used + 1, right_used, n, result + '(')
        if left_used > right_used and right_used < n:
            self.helper(left_used, right_used + 1, n, result + ')')
```

## 51. N皇后 N-Queens

[LeetCodeCN 第51题链接](https://leetcode-cn.com/problems/n-queens/)

```python
class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        self.result = []
        self.col = set()
        self.sum = set()
        self.dif = set()
        self._dfs(n, 0, [])
        return self._gen(n)
        
    def _dfs(self, n, row, state):
        if row >= n:
            self.result.append(state)
            return
        for col in range(n):
            if col in self.col or row+col in self.sum or row-col in self.dif:
                continue
            self.col.add(col)
            self.sum.add(row + col)
            self.dif.add(row - col)
            
            self._dfs(n, row + 1, state + [col])
            
            self.col.remove(col)
            self.sum.remove(row + col)
            self.dif.remove(row - col)
            
    def _gen(self, n):
        result = []
        for res in self.result:
            graph = []
            for i in res:
                graph.append('.'*i + 'Q' + '.'*(n-i-1))
            result.append(graph)
        return result
```