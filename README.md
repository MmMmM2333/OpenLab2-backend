# OpenLab2-backend

## 0、配置环境

```
npm install
node app.js
```

## 1、接口介绍

### 备注：

除了login和register接口以外都需要携带JWT

### /login

登录接口，POST方式

参数：

username，用户名，必填

password，用户名，必填

### /register

注册接口，POST方式

参数：

username，用户名，必填

studentID，学号，必填

password，密码，必填

### /rank

获取排行榜，GET方式

无需参数

### /addProblem

添加一个题目，POST方式

参数：

miniTitle，题目简称，必填

title，完整题目名称，必填

description，题目描述，选填

score，题目分数，选填，默认值为10

showInRank，是否在排行榜启用，必填

### /removeProblem

移除一个题目，需要管理员权限，GET方式

参数：

id，题目ID，必填

### /edirProblem

编辑一个题目，需要管理员权限，POST方式

### /removeUser

移除一个用户，需要管理员权限，GET方式

参数：

id，用户ID，必填

### /getUserInfo

获取用户信息，当获取自己信息时，无需管理员权限，获取他人信息则需要管理员权限，GET方式

参数：

id，用户ID，必填

### /getProblem

获取一道题目的信息，GET方式

参数：

id，题目ID，必填

### /getProblems

获取所有题目信息，GET方式

无需参数

### /submitScore

提交分数，GET方式

参数

problemID，题目ID，必填

score，分数，必填

### /getAllUsers

获取全部用户信息，需要管理员权限，GET方式

无需参数
