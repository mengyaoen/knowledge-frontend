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

    <!-- 2. 管理后台（已登录时显示） -->
    <div v-else>
      <!-- 顶部导航栏与退出按钮 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>知识点共享平台管理后台</h2>
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>

      <!-- 菜单切换 -->
      <el-menu :default-active="activeMenu" mode="horizontal" @select="handleSelect" style="margin-bottom: 20px;">
        <el-menu-item index="course">课程管理</el-menu-item>
        <el-menu-item index="knowledge">知识点管理</el-menu-item>
      </el-menu>

      <!-- ================== 视图A：课程管理 ================== -->
      <div v-if="activeMenu === 'course'">
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
      </div>

      <!-- ================== 视图B：知识点管理 ================== -->
      <div v-if="activeMenu === 'knowledge'">
        <el-button type="primary" @click="openKnowledgeDialog" style="margin-bottom: 20px;">发布知识点</el-button>
        <el-table :data="knowledgeList" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="知识点标题" />
          <el-table-column prop="content" label="知识点内容" />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="handleDeleteKnowledge(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ================== 弹窗区 ================== -->
      <!-- 课程弹窗 -->
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
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认提交</el-button>
        </template>
      </el-dialog>

      <!-- 知识点弹窗 -->
      <el-dialog v-model="knowledgeDialogVisible" title="发布知识点" width="500px">
        <el-form :model="knowledgeForm" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="knowledgeForm.title" placeholder="请输入知识点标题" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input v-model="knowledgeForm.content" type="textarea" :rows="4" placeholder="请输入详细内容" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="knowledgeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitKnowledge">确认发布</el-button>
        </template>
      </el-dialog>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from './utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 全局状态 ---
const isLoggedIn = ref(!!localStorage.getItem('token'))
const activeMenu = ref('course') // 当前显示的菜单：course 或 knowledge
const loginForm = ref({ username: '', password: '' })

// 切换菜单
const handleSelect = (index) => {
  activeMenu.value = index
}

// --- 登录/退出逻辑 ---
const handleLogin = () => {
  request.post('/api/user/login', loginForm.value).then(res => {
    if (res.code === 200) {
      localStorage.setItem('token', res.data)
      ElMessage.success('登录成功！')
      isLoggedIn.value = true
      fetchCourses()
      fetchKnowledgeList()
    } else { ElMessage.error(res.msg) }
  }).catch(() => ElMessage.error('网络错误，请检查后端'))
}

const handleLogout = () => {
  localStorage.removeItem('token')
  isLoggedIn.value = false
  ElMessage.success('已退出登录')
}

// ================== 课程管理逻辑 ==================
const courses = ref([])
const dialogVisible = ref(false)
const form = ref({ name: '', description: '' })
const editId = ref(null)

const fetchCourses = () => {
  request.get('/api/course/list').then(res => {
    if (res.code === 200) courses.value = res.data
  })
}

const openDialog = () => {
  form.value = { name: '', description: '' }
  editId.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = { name: row.name, description: row.description }
  editId.value = row.id
  dialogVisible.value = true
}

const submitForm = () => {
  if (editId.value) {
    form.value.id = editId.value
    request.put('/api/course/update', form.value).then(res => {
      if (res.code === 200) { ElMessage.success('修改成功！'); dialogVisible.value = false; fetchCourses() }
    })
  } else {
    request.post('/api/course/add', form.value).then(res => {
      if (res.code === 200) { ElMessage.success('新增成功！'); dialogVisible.value = false; fetchCourses() }
    })
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除课程 "' + row.name + '" 吗?', '警告', { type: 'warning' }).then(() => {
    request.delete('/api/course/delete/' + row.id).then(res => {
      if (res.code === 200) { ElMessage.success('删除成功！'); fetchCourses() }
    })
  })
}

// ================== 知识点管理逻辑 ==================
const knowledgeList = ref([])
const knowledgeDialogVisible = ref(false)
const knowledgeForm = ref({ title: '', content: '' })

const fetchKnowledgeList = () => {
  request.get('/api/knowledge/list').then(res => {
    if (res.code === 200) knowledgeList.value = res.data
  })
}

const openKnowledgeDialog = () => {
  knowledgeForm.value = { title: '', content: '' }
  knowledgeDialogVisible.value = true
}

const submitKnowledge = () => {
  request.post('/api/knowledge/add', knowledgeForm.value).then(res => {
    if (res.code === 200) {
      ElMessage.success('发布成功！')
      knowledgeDialogVisible.value = false
      fetchKnowledgeList() // 刷新列表
    }
  })
}

const handleDeleteKnowledge = (row) => {
  ElMessageBox.confirm('确定要删除知识点 "' + row.title + '" 吗?', '警告', { type: 'warning' }).then(() => {
    request.delete('/api/knowledge/delete/' + row.id).then(res => {
      if (res.code === 200) { ElMessage.success('删除成功！'); fetchKnowledgeList() }
    })
  })
}

// 页面加载
onMounted(() => {
  if (isLoggedIn.value) {
    fetchCourses()
    fetchKnowledgeList()
  }
})
</script>