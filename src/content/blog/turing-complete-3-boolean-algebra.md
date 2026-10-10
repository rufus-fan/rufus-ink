---
title: 布尔代数其实是一门算术：定律、推导与化简
publishDate: 2026-10-01
description: 《图灵完备》游戏笔记第三篇：八条基本定律、三条关键推导、一个完整化简示例。把定律亲手推一遍，化简就只是算术题。
tags:
  - 图灵完备
  - 布尔代数
  - 数字电路
language: 中文
heroImage:
  src: ./covers/turing-complete-3-boolean-algebra.png
  color: "#917500"
---

> [!NOTE/AI 速读]
> 布尔代数的八条定律、三条关键推导与完整化简示例，化简只是算术题。

[前一篇](/blog/turing-complete-2-nand)说到用与非门拼出其他门，用的其实就是布尔代数的运算规则。这一篇把它们摆上台面——你会发现所谓化简，每一步都只是算术题。

## 八条基本定律

每条定律都成对出现，或形式和与形式长得像双胞胎：

- **幂等律**：$A + A = A$，$A \cdot A = A$
- **互补律**：$A + \overline{A} = 1$，$A \cdot \overline{A} = 0$
- **交换律**：$A + B = B + A$，$A \cdot B = B \cdot A$
- **结合律**：$(A + B) + C = A + (B + C)$，$(A \cdot B) \cdot C = A \cdot (B \cdot C)$
- **分配律**：$A \cdot (B + C) = A \cdot B + A \cdot C$，$A + B \cdot C = (A + B) \cdot (A + C)$
- **吸收律**：$A + A \cdot B = A$，$A \cdot (A + B) = A$
- **双重否定律**：$\overline{\overline{A}} = A$
- **德摩根定律**：$\overline{A + B} = \overline{A} \cdot \overline{B}$，$\overline{A \cdot B} = \overline{A} + \overline{B}$

## 三条值得亲手推一遍的式子

定律背下来只是第一步，值得动手算的是下面三条——它们正好对应前面埋下的伏笔。

### 1. 吸收律的来路

$$
A + A \cdot B = A \cdot 1 + A \cdot B = A \cdot (1 + B) = A \cdot 1 = A
$$

第一步用 $A = A \cdot 1$，第二步把 $A$ 提出来，第三步用到 $1 + B = 1$。吸收律看起来像魔法，拆开每一步都是分配律和互补律。

### 2. 卡诺图合并的根

$$
A \cdot B + A \cdot \overline{B} = A \cdot (B + \overline{B}) = A \cdot 1 = A
$$

两个乘积项只有一个变量相反，就能合并，把那个变量消掉。这句话是[下一篇](/blog/turing-complete-4-karnaugh-map)整张卡诺图的理论依据，先在这里把它推出来。

### 3. 从与非门推出或门

$$
\overline{\overline{A} \cdot \overline{B}} = \overline{\overline{A}} + \overline{\overline{B}} = A + B
$$

先对整体用一次德摩根定律，再对每个 $\overline{A}$、$\overline{B}$ 用双重否定。前一篇表格里「OR 用与非门怎么搭」那一行，推导过程就在这里。

## 异或的代数写法

XOR 也有自己的代数表达式：

$$
A \oplus B = \overline{A} \cdot B + A \cdot \overline{B}
$$

两个输入相异输出 1，恰好就是真值表里输出 1 的那两行拼起来。同或就是整体取反：

$$
A \odot B = \overline{A \oplus B}
$$

## 用一个完整例子把定律串起来

化简 $F = A \cdot B + A \cdot \overline{B} + \overline{A} \cdot B$。

先合并前两项：

$$
A \cdot B + A \cdot \overline{B} = A \cdot (B + \overline{B}) = A
$$

式子变成 $F = A + \overline{A} \cdot B$。这时候还差一步，$\overline{A} \cdot B$ 能整个消掉：

$$
A + \overline{A} \cdot B = (A + \overline{A}) \cdot (A + B) = 1 \cdot (A + B) = A + B
$$

这是分配律的或形式配合互补律。最终 $F = A + B$，一个三项式子化简成一颗或门。

## 在游戏里怎么用

- **幂等律反着看**：$A + A = A$，把同一条线接到同一个输入两次，纯属浪费；
- **吸收律删多余项**：$A + A \cdot B = A$，多出来的 $A \cdot B$ 整项删掉，门就少一颗；
- **德摩根换门**：手头只有 NAND 时，OR 就用 $\overline{\overline{A} \cdot \overline{B}}$ 来搭，省下一颗反相器；
- **卡诺图是这套定律的图形版**：圈组就是在找 $B + \overline{B}$ 这对互补变量，找到一对，就消掉一个变量。

下一篇就讲这张图：卡诺图。
