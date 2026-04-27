# LeanLife Backend Skeleton

这不是最终后端实现，而是一套为了多人协作和后续正式开发准备的清晰骨架。

## 目录职责

### `schema.sql`

数据库结构骨架，负责定义：

- 多用户数据隔离
- 食物记录
- 营养快照
- 推荐快照

### `openapi.yaml`

API 契约骨架，负责定义：

- 接口路径
- 请求结构
- 响应结构
- 多端协作边界

### `src/shared`

共享类型与跨模块约定，负责：

- 基础 ID / 日期 / 分页 / 算法版本类型
- 公共响应包装
- 所有模块都要复用的通用结构

### `src/modules/auth`

只负责：

- 注册
- 登录
- token 会话
- 当前用户身份

不负责：

- 用户身体评估
- 日历记录
- 营养分析

### `src/modules/profile`

只负责：

- 用户档案
- 静态身体资料
- 生活习惯资料

不负责：

- 评估算法
- 推荐逻辑

### `src/modules/assessments`

只负责：

- 身体评估输入
- 评估结果快照
- 推荐饮食方案
- 日目标热量和宏量营养

不负责：

- 每日食物录入
- 日历展示

### `src/modules/tracking`

只负责：

- 某日身体反馈记录
- 体重 / 腰围 / 主观状态趋势
- 日历日级数据聚合

不负责：

- 食物数据库维护
- 营养分析细节

### `src/modules/nutrition`

只负责：

- 食物条目写入
- 单位换算
- 每日营养汇总
- 微量元素覆盖
- 当日超标提醒与缺口推荐

不负责：

- 注册登录
- 档案维护

## 当前已落成的工程骨架

现在项目里已经有：

1. `controller`
   - 只负责输入输出边界

2. `service`
   - 只负责业务编排

3. `repository`
   - 只负责数据持久化实现

4. `index`
   - 只负责模块组装

5. `src/main.ts`
   - 只负责应用入口

6. `src/server/create-application.ts`
   - 只负责 composition root

这意味着后续如果切 NestJS：

- 可以把 controller 替换成 Nest Controller
- service 保持业务语义不变
- repository 换成 PostgreSQL 实现

如果切 FastAPI：

- 可以复用 contract 语义
- 再按 Python 方式重建同样的模块职责

## 当前已可工作的最小链路

现在 `auth + profile + assessments + tracking + nutrition` 已经不再是纯占位返回，而是接上了本地开发持久化：

1. 用户注册会写入本地 JSON 存储
2. 登录会校验密码
3. 用户档案会按用户 ID 创建和更新
4. 身体评估会基于档案和输入生成目标热量、宏量营养和推荐方案
5. 某日身体反馈记录会落盘
6. 趋势接口会根据日级记录生成点位与体重滚动周均值
7. 饮食记录会落盘，并生成当日营养汇总、宏量卡片、微量元素卡片和补缺口建议
8. 启动入口会自动跑一条 demo 注册 / 登录 + 档案更新 + 评估 + 追踪 + 营养分析链路
9. HTTP server 已经开放出工作台需要的最小接口，包括：
   - `POST /v1/auth/register`
   - `POST /v1/auth/login`
   - `GET/PUT /v1/profile`
   - `GET/POST /v1/assessments`
   - `GET/PUT /v1/daily-logs/:date`
   - `POST /v1/daily-logs/:date/foods`
   - `GET /v1/daily-logs/:date/analysis`
   - `GET /v1/trends`
   - `GET /v1/foods`
   - `GET /health`

本地开发数据默认写入：

- `backend/.data/dev-storage.json`

## 当前如何阅读

如果只想理解已经能工作的链路，建议顺序：

1. `src/main.ts`
2. `src/server/create-application.ts`
3. `src/shared/persistence/dev-data-store.ts`
4. `src/shared/security/password-codec.ts`
5. `src/modules/auth/*`
6. `src/modules/profile/*`
7. `src/modules/assessments/assessment-calculator.ts`
8. `src/modules/assessments/*`
9. `src/modules/tracking/*`
10. `src/modules/nutrition/nutrition-catalog.ts`
11. `src/modules/nutrition/nutrition-analysis.ts`
12. `src/modules/nutrition/*`

## 与前端的连接方式

当前前端不是直接从浏览器打后端，而是采用：

1. 浏览器 -> `frontend/src/app/api/workspace/*`
2. Next API 层 -> backend HTTP API
3. backend HTTP API -> modules / repositories

这样做的好处是：

- 浏览器层职责更轻
- 后端 token 和 demo 会话逻辑可以先留在服务端
- 后续切正式鉴权时，不需要推翻前端页面组件

## 推荐实现顺序

1. 先实现 `shared` 基础类型
2. 再实现 `auth` 和 `profile`
3. 再实现 `assessments`
4. 再实现 `tracking`
5. 最后实现 `nutrition`

## 给后续 Codex 的建议

如果后续有新的 Codex 接手，建议优先阅读顺序：

1. `docs/multi-user-mvp-architecture.md`
2. `backend/README.md`
3. `backend/openapi.yaml`
4. `backend/schema.sql`
5. `backend/src/shared/core-types.ts`
6. 再按模块进入各自的 `*.contract.ts`
