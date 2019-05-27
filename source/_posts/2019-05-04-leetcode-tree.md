---
title: LeetCode做题笔记—二叉树相关题目
date: 2019-05-04 14:29:10
tags: 
  - LeetCode
  - Algorithm
  - Python
categories:
  - Algorithm
---

有关二叉树的做题笔记，Python实现

## 二叉树的定义
```python
# Definition for a binary tree node.
class TreeNode:
    def __init__(self, x):
        self.val = x
        self.left = None
        self.right = None
```

## 226. 翻转二叉树 Invert Binary Tree

[LeetCodeCN 第226题链接](https://leetcode-cn.com/problems/invert-binary-tree/)

第一种方法：递归

<!-- more -->

```python
class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:
        if root:
            root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
            return root
```

第二种方法：遍历
```python
class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:
        stack = [root]
        while stack:
            node = stack.pop()
            if node:
                node.left, node.right = node.right, node.left
                stack.append(node.left)
                stack.append(node.right)
        return root
```

## 98. 验证二叉搜索树 Validate Binary Search Tree

[LeetCodeCN 第98题链接](https://leetcode-cn.com/problems/validate-binary-search-tree/)

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

第三种方法：递归验证每个节点左孩子的值是否小于父亲节点的值以及右孩子的值是否大于父亲节点的值

```python
class Solution:
    def isValidBST(self, root: TreeNode) -> bool:
        mini, maxi = float('-inf'), float('inf') 
        return self.isValid(root, mini, maxi)
    
    def isValid(self, root: TreeNode, mini: int, maxi: int) -> bool:
        if root is None:
            return True
        if mini >= root.val or maxi <= root.val:
            return False
        return self.isValid(root.left, mini, root.val) and self.isValid(root.right, root.val, maxi)
```

## 236. 二叉树的最近公共祖先 Lowest Common Ancestor of a Binary Tree

[LeetCodeCN 第236题链接](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-tree/)

首先如果root为空，返回root，然后如果root就是p或者q，那root就是最近公共祖先。然后分别对左子树和右子树做递归并保存结果，如果两边都能找到，证明本节点就是最近公共祖先，如果一边找得到，一边找不到，则往能找到的那边继续找下去。

```python
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if root is None:
            return None
        if root == p or root == q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left or right:
            if left is None:
                return right
            elif right is None:
                return left
            else:
                return root
        else:
            return None
```

## 235. 二叉搜索树的最近公共祖先 Lowest Common Ancestor of a Binary Search Tree

[LeetCodeCN 第235题链接](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-search-tree/)

第一种方法：还用上面的方法

第二种方法：利用二叉搜索树的左子树都小于父亲节点，右子树都大于父亲节点的特性，可以把第一种方法简化一下

```python
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if p.val < root.val and q.val < root.val:
            return self.lowestCommonAncestor(root.left, p, q)
        if p.val > root.val and q.val > root.val:
            return self.lowestCommonAncestor(root.right, p, q)
        return root
```

第三种方法：跟方法二的思路一样，把递归改成循环

```python
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        while root:
            if p.val < root.val and q.val < root.val:
                root = root.left
            elif p.val > root.val and q.val > root.val:
                root = root.right
            else:
                return root
```

## 112. 路径总和

[LeetCodeCN 第112题链接](https://leetcode-cn.com/problems/path-sum/)

第一种方法：DFS，用一个数组记录每条路线的路径和，最后检查目标值是否在数组内

```python
class Solution:
    def hasPathSum(self, root: TreeNode, sum: int) -> bool:
        if not root:
            return False
        self.res = []
        self.dfs(root, 0)
        if sum in self.res:
            return True
        else:
            return False
            
    def dfs(self, node, tmp):
        if not node.left and not node.right:
            self.res.append(tmp+node.val)
            return
        if node.left:
            self.dfs(node.left, tmp+node.val)
        if node.right:
            self.dfs(node.right, tmp+node.val)
```

第二种方法：每次递归时从目标值里扣除自身节点的值，如果到某个叶子节点正好剩余目标值等于叶子节点的值说明存在该路径

```python
class Solution:
    def hasPathSum(self, root: TreeNode, sum: int) -> bool:
        if not root:
            return False
        if not root.left and not root.right and sum == root.val:
            return True
        sum -= root.val
        return self.hasPathSum(root.left, sum) or self.hasPathSum(root.right, sum)
```