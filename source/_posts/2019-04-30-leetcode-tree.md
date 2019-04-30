---
title: LeetCode做题笔记—二叉树相关题目
date: 2019-04-30 14:29:10
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关哈希表的做题笔记，Python实现

## 二叉树的定义
```python
# Definition for a binary tree node.
class TreeNode:
    def __init__(self, x):
        self.val = x
        self.left = None
        self.right = None
```

## 98.验证二叉搜索树 Validate Binary Search Tree

第一种方法：中序遍历二叉树存入数组，与直接升序排序去重后的原二叉树对比

```python
class Solution:
    def isValidBST(self, root: TreeNode) -> bool:
        inorder = self.inorder(root)
        return inorder == list(sorted(set(inorder)))
        
    def inorder(self, root) -> list:
        if root is None:
            return []
        return self.inorder(root.left) + [root.val] + self.inorder(root.right)
```

第二种方法：中序遍历只用比较前一节点的值是否小于当前节点的值即可，不用储存

```python
class Solution:
    def isValidBST(self, root: TreeNode) -> bool:
        self.prev = None
        return self.helper(root)
    
    def helper(self, root):
        if root is None:
            return True
        if not self.helper(root.left):
            return False
        if self.prev and self.prev.val >= root.val:
            return False
        self.prev = root
        return self.helper(root.right)
```