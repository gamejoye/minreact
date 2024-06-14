# minreact
实现最简单的react18模型

`minreact` 是一个简化版的 React 18 实现，旨在深入理解 React 的核心机制。此项目重点关注于 React 18 的关键特性，如同步渲染、Hooks 支持等，通过构建最基础的 React 模型来探索这些概念。

## 特性简介
本项目尝试复现 React 18 的一些核心特性，通过简化的方式让开发者更容易理解其背后的原理。主要特点包括：

- **同步渲染**：了解和实现 React 的基本渲染流程。
- **Hooks 支持**：探索 React Hooks 如何在函数组件中管理状态和副作用。
- **可中断渲染**：模拟 React 18 中的中断渲染特性。
- **优先级管理**：实现优先级调度，理解 React 中任务调度的机制。

## TodoList
- [X] 同步渲染
  - [X] commitMutationEffects(将虚拟dom映射到真实dom)
  - [X] 处理commitMutation阶段的commmitDeletion逻辑
    - [X] dom删除逻辑
  - [ ] commitLayoutEffects(处理useLayoutEffect)
- [ ] 支持hooks
  - [X] useState
  - [X] useEffect
  - [ ] useLayoutEffect 
- [X] 可中断渲染
- [ ] 优先级管理
  - [ ] useTransition
  - [ ] useDeferredValue

## 安装

使用 npm 安装：

```sh
npm i @gamejoye/minreact
```

## 快速开始

- 入口
```
import { createRoot } from '@gamejoye/minreact';

const root = createRoot(document.getElementById('root'));
root.render(
  <div>Replace this with your app</div>
);
```

- 使用 useState useEffect
```
import { useState, useEffect } from "@gamejoye/minreact";

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('App mount...');

    return () => {
      console.log('App unmount...');
    };
  }, [count]);

  const add = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <div>
        this is div element, count: {count}
      </div>
      <button onClick={add}>add count</button>
    </div>
  );
}
```

## 运行本项目

克隆项目到本地

```sh
git clone https://github.com/gamejoye/minreact.git
```

进入项目根目录运行

```sh
cd minreact
npm run dev
```



## 联系方式
- gamejoye@gmail.com