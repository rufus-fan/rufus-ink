---
title: Python 魔法方法速查：从 __repr__ 谈起
publishDate: 2026-10-19
description: 魔法方法是 Python 的「钩子」：定义之后由解释器在特定时机自动触发，让你的自定义类支持 print、比较、运算、循环、len、in 等内置操作。
tags:
  - Python
  - 编程基础
language: 中文
---

> [!NOTE/AI 速读]
> 魔法方法是 Python 的钩子：定义后由解释器自动触发，让类支持各种内置操作。

## `__repr__` 是什么

`__repr__` 用来定义对象被 `print()` 或在终端显示时的字符串。

**不写它**，打印对象会显示一堆内存地址：

```python
print(card)   # <__main__.Card object at 0x7f...>
```

**写了它**，可以自定义显示内容：

```python {2-3}
class Card:
    def __repr__(self):
        return '一张牌'

print(card)   # 一张牌
```

## 什么是魔法方法

名字以**双下划线**开头和结尾的方法，叫做**魔法方法**（也叫 dunder method）。

核心特点：**你不用手动调用，Python 会在特定时机自动触发**。

```python {2,5}
class Card:
    def __init__(self):       # 创建对象时自动触发
        print('初始化')

    def __repr__(self):       # print(obj) 时自动触发
        return '一张牌'

card = Card()     # 自动触发 __init__
print(card)       # 自动触发 __repr__
```

## 常用魔法方法清单

### 1. 生命周期

- `__init__`：初始化对象（最常用）
- `__new__`：创建对象
- `__del__`：对象销毁时

### 2. 字符串表示

- `__str__`：`print(obj)` 时触发（给用户看）
- `__repr__`：`repr(obj)` 或终端显示时触发（给开发者看）
- `__format__`：f-string 中 `{obj}` 时触发

### 3. 比较运算

- `__eq__` → `==`，`__ne__` → `!=`
- `__lt__` → `<`，`__le__` → `<=`
- `__gt__` → `>`，`__ge__` → `>=`

### 4. 算术运算

- `__add__` → `+`，`__sub__` → `-`，`__mul__` → `*`
- `__truediv__` → `/`，`__floordiv__` → `//`，`__mod__` → `%`，`__pow__` → `**`

### 5. 容器协议（让对象像列表/字典）

- `__len__`：`len(obj)`
- `__getitem__` / `__setitem__` / `__delitem__`：`obj[i]`、`obj[i] = value`、`del obj[i]`
- `__contains__`：`x in obj`
- `__iter__` / `__next__`：`for x in obj`

### 6. 其他常用

- `__call__`：`obj()` 把对象当函数调用
- `__enter__` / `__exit__`：`with` 语句
- `__getattr__` / `__setattr__`：属性访问控制
- `__int__` / `__float__` / `__bool__`：类型转换
- `__hash__`：用作 dict 的键

## 两个核心例子

### 例 1：比较运算（让你的类能用 `<` `>`）

```python {5-6}
class Card:
    def __init__(self, face):
        self.face = face

    def __lt__(self, other):
        return self.face < other.face

c1 = Card(3)
c2 = Card(7)
print(c1 < c2)   # True
```

### 例 2：可调用对象（把对象当函数用）

```python {5-6}
class Multiplier:
    def __init__(self, factor):
        self.factor = factor

    def __call__(self, x):
        return x * self.factor

double = Multiplier(2)
print(double(5))   # 10
```

## 一句话总结

**魔法方法 = Python 的「钩子」**。你定义它们，Python 在特定时机自动调用，让你的自定义类能支持各种内置操作——print、比较、运算、循环、len、in，等等。
