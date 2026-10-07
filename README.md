# 高校知识点共享平台 - 前端

本项目是一个基于 Vue3 + Vite 构建的高校知识点共享平台前端代码。

## 🛠 技术栈
- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **UI 组件库**：Element Plus
- **网络请求**：Axios（封装了请求/响应拦截器，实现 JWT 自动携带）
- **状态管理**：本地 LocalStorage

核心功能
1. **双视图切换**：基于 RBAC 模型，管理员进入后台表格管理，普通学生进入前台贴吧卡片流。
2. **用户模块**：注册、登录、修改密码、忘记密码（接入 Redis 验证码）。
3. **知识点模块**：发帖、卡片流展示、详情弹窗、多表关联评论互动。
4. **后台管理**：课程管理、知识点管理的完整 CRUD。

## 🔗 关联仓库
- **后端代码**：[knowledge-platform](https://github.com/mengyaoen/knowledge-platform)

## 🚀 本地运行
1. 安装依赖：`npm install`
2. 启动项目：`npm run dev`
3. 访问：`http://localhost:5173`
