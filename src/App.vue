<template>
  <div style="padding: 20px; width: 900px; margin: 0 auto;">
    
    <!-- 1. 登录页面（未登录时显示） -->
    <div v-if="!isLoggedIn" style="width: 300px; margin: 100px auto;">
      <h2>系统登录</h2>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleLogin" style="width: 100%;">登录</el-button>
    </div>

    <!-- 2. 课程管理后台（已登录时显示） -->
    <div v-else>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>课程管理后台</h2>
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>

      <el-button type="primary" @click="openDialog" style="margin-bottom: 20px;">新增课程</el-button>

      <el-table :data="courses" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="description" label="课程描述" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 新增/编辑 课程的弹窗 -->
      <el-dialog v-model="dialogVisible" :title="editId ? '编辑课程' : '新增课程'" width="400px">
        <el-form :model="form" label-width="80px">
          <el-form-item label="课程名称">
            <el-input v-model="form.name" placeholder="请输入课程名称" />
          </el-form-item>
          <el-form-item label="课程描述">
            <el-input v-model="form.description" placeholder="请输入课程描述" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确认提交</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from './utils/request' // 引入我们封装好的 Axios
import { ElMessage, ElMessageBox } from 'element-plus'

// 登录状态，初始为 localStorage 里是否有 token
const isLoggedIn = ref(!!localStorage.getItem('token'))
// 登录表单
const loginForm = ref({ username: '', password: '' })

const courses = ref([])
const dialogVisible = ref(false)
const form = ref({ name: '', description: '' })
const editId = ref(null)

// 登录操作
const handleLogin = () => {
  request.post('/api/user/login', loginForm.value)
    .then(res => {
      if (res.code === 200) {
        // 1. 把 Token 存进 localStorage
        localStorage.setItem('token', res.data)
        ElMessage.success('登录成功！')
        // 2. 修改状态，切到管理页面
        isLoggedIn.value = true
        // 3. 立刻拉取课程数据
        fetchCourses()
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch(err => {
      ElMessage.error('网络错误，请检查后端是否启动')
      console.error(err)
    })
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  isLoggedIn.value = false
  ElMessage.success('已退出登录')
}

// 获取列表
const fetchCourses = () => {
  // 注意：这里的路径去掉了 http://localhost:8080，因为 request.js 里配了 baseURL
  request.get('/api/course/list')
    .then(res => {
      if (res.code === 200) {
        courses.value = res.data
      }
    })
}

onMounted(() => {
  if (isLoggedIn.value) {
    fetchCourses()
  }
})

// 打开新增弹窗
const openDialog = () => {
  form.value = { name: '', description: '' }
  editId.value = null
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  form.value = { name: row.name, description: row.description }
  editId.value = row.id
  dialogVisible.value = true
}

// 提交表单（新增或修改）
const submitForm = () => {
  if (editId.value) {
    form.value.id = editId.value
    request.put('/api/course/update', form.value).then(res => {
      if (res.code === 200) {
        ElMessage.success('修改成功！')
        dialogVisible.value = false
        fetchCourses()
      }
    })
  } else {
    request.post('/api/course/add', form.value).then(res => {
      if (res.code === 200) {
        ElMessage.success('新增成功！')
        dialogVisible.value = false
        fetchCourses()
      }
    })
  }
}

// 删除课程
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除课程 "' + row.name + '" 吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    request.delete('/api/course/delete/' + row.id).then(res => {
      if (res.code === 200) {
        ElMessage.success('删除成功！')
        fetchCourses()
      }
    })
  })
}
</script>