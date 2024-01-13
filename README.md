# mini-react
实现最简单的react18模型

`mini-react` 是一个简化版的 React 18 实现，旨在深入理解 React 的核心机制。此项目重点关注于 React 18 的关键特性，如同步渲染、Hooks 支持等，通过构建最基础的 React 模型来探索这些概念。

## 特性简介
本项目尝试复现 React 18 的一些核心特性，通过简化的方式让开发者更容易理解其背后的原理。主要特点包括：

- **同步渲染**：了解和实现 React 的基本渲染流程。
- **Hooks 支持**：探索 React Hooks 如何在函数组件中管理状态和副作用。
- **可中断渲染**：模拟 React 18 中的中断渲染特性。
- **优先级管理**：实现优先级调度，理解 React 中任务调度的机制。

## TodoList
- [X] 同步渲染
  - [X] commitMutationEffects(将虚拟dom映射到真实dom)
  - [ ] 处理commitMutation阶段的commmitDeletion逻辑
    - [X] dom删除逻辑
    - [ ] effect destory处理
  - [ ] commitLayoutEffects(处理useLayoutEffect)
- [ ] 支持hooks
  - [X] useState
  - [ ] useEffect
  - [ ] useLayoutEffect 
- [ ] 可中断渲染
- [ ] 优先级管理
  - [ ] useTransition
  - [ ] useDeferredValue

## 联系方式
- gamejoye@gmail.com

## 学习资料
