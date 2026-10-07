<template>
  <div style="padding: 20px; width: 900px; margin: 0 auto;">
    
    <!-- 1. 登录页面 -->
    <div v-if="!isLoggedIn" style="width: 350px; margin: 100px auto;">
      <h2>{{ isRegister ? '注册新账号' : '系统登录' }}</h2>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <!-- 注册时才显示的确认密码 -->
        <el-form-item label="确认密码" v-if="isRegister">
          <el-input v-model="loginForm.confirmPassword" type="password" placeholder="请再次输入密码" />
        </el-form-item>
      </el-form>
      
      <el-button type="primary" @click="isRegister ? handleRegister() : handleLogin()" style="width: 100%;">
        {{ isRegister ? '注 册' : '登 录' }}
      </el-button>
      
      <!-- 底部切换链接 -->
      <div style="text-align: center; margin-top: 15px; font-size: 14px; color: #409EFF;">
        <span style="cursor: pointer;" @click="toggleLoginRegister">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </span>
        <span v-if="!isRegister" style="margin: 0 10px; color: #ccc;">|</span>
        <span v-if="!isRegister" style="cursor: pointer;" @click="openForgotPwdDialog">
          忘记密码？
        </span>
      </div>

      <!-- 👇👇👇 关键修复：忘记密码弹窗放在这里！ 👇👇👇 -->
      <el-dialog v-model="forgotPwdVisible" title="重置密码" width="400px">
        <el-form :model="forgotForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="forgotForm.username" placeholder="请输入注册时的用户名" />
          </el-form-item>
                    <el-form-item label="验证码">
            <div style="display: flex; gap: 10px;">
              <el-input v-model="forgotForm.code" placeholder="请输入验证码" />
              <el-button type="primary" @click="sendCode" :disabled="countdown > 0">
                {{ countdown > 0 ? countdown + '秒后重发' : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="forgotForm.newPassword" type="password" placeholder="请输入新密码" />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="forgotForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="forgotPwdVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForgotPwd">确认重置</el-button>
        </template>
      </el-dialog>
      <!-- 👆👆👆 修复结束 👆👆👆 -->
    </div>

    <!-- 2. 主界面 -->
    <div v-else>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>{{ userRole === 'admin' ? '知识点共享平台 - 管理后台' : '高校知识贴吧' }}</h2>
        <div>
          <el-button type="primary" size="small" @click="openPwdDialog" style="margin-right: 10px;">修改密码</el-button>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </div>

      <!-- 动态菜单 -->
      <el-menu :default-active="activeMenu" mode="horizontal" @select="handleSelect" style="margin-bottom: 20px;">
        <el-menu-item index="home">前台首页（贴吧模式）</el-menu-item>
        <el-menu-item v-if="userRole === 'admin'" index="course">课程管理</el-menu-item>
        <el-menu-item v-if="userRole === 'admin'" index="knowledge">知识点管理</el-menu-item>
      </el-menu>

      <!-- 视图A：前台贴吧首页 -->
      <div v-if="activeMenu === 'home'">
        <el-button type="primary" @click="openKnowledgeDialog" style="margin-bottom: 20px;">发布新帖</el-button>
        <el-row :gutter="20">
          <el-col :span="8" v-for="item in knowledgeList" :key="item.id" style="margin-bottom: 20px;">
            <el-card shadow="hover" @click="openDetail(item)" style="cursor: pointer;">
              <template #header>
                <div style="font-weight: bold; font-size: 16px;">{{ item.title }}</div>
              </template>
              <div style="color: #666; font-size: 14px; height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                {{ item.content }}
              </div>
              <div style="margin-top: 10px; font-size: 12px; color: #999; text-align: right;">
                发布时间：{{ item.createTime }}
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 视图B：后台课程管理 -->
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

      <!-- 视图C：后台知识点管理 -->
      <div v-if="activeMenu === 'knowledge'">
        <el-button type="primary" @click="openKnowledgeDialog" style="margin-bottom: 20px;">发布知识点</el-button>
        <el-table :data="knowledgeList" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="content" label="内容" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="handleDeleteKnowledge(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 弹窗区（主界面的弹窗） -->
      <el-dialog v-model="dialogVisible" :title="editId ? '编辑课程' : '新增课程'" width="400px">
        <el-form :model="form" label-width="80px">
          <el-form-item label="课程名称"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="课程描述"><el-input v-model="form.description" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认提交</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="knowledgeDialogVisible" title="发布知识点" width="500px">
        <el-form :model="knowledgeForm" label-width="80px">
          <el-form-item label="标题"><el-input v-model="knowledgeForm.title" /></el-form-item>
          <el-form-item label="内容"><el-input v-model="knowledgeForm.content" type="textarea" :rows="4" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="knowledgeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitKnowledge">确认发布</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="detailVisible" :title="currentDetail.title" width="600px">
        <div style="line-height: 1.6; margin-bottom: 10px;">{{ currentDetail.content }}</div>
        <div style="color: #999; font-size: 12px; margin-bottom: 20px;">发布时间：{{ currentDetail.createTime }}</div>
        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <h4>💬 评论区</h4>
          <div v-if="comments.length === 0" style="color: #999; font-size: 13px; margin-bottom: 15px;">还没有人评论，快来抢沙发！</div>
          <div v-for="cm in comments" :key="cm.id" style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #eee;">
            <div style="font-weight: bold; font-size: 14px; color: #409EFF;">{{ cm.username }}</div>
            <div style="font-size: 14px; margin: 5px 0;">{{ cm.content }}</div>
            <div style="font-size: 12px; color: #999;">{{ cm.createTime }}</div>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <el-input v-model="newComment" placeholder="写下你的评论..." />
            <el-button type="primary" @click="submitComment">发表评论</el-button>
          </div>
        </div>
      </el-dialog>

      <el-dialog v-model="pwdDialogVisible" title="修改密码" width="400px">
        <el-form :model="pwdForm" label-width="80px">
          <el-form-item label="原密码"><el-input v-model="pwdForm.oldPassword" type="password" placeholder="请输入原密码" /></el-form-item>
          <el-form-item label="新密码"><el-input v-model="pwdForm.newPassword" type="password" placeholder="请输入新密码" /></el-form-item>
          <el-form-item label="确认密码"><el-input v-model="pwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="pwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpdatePwd">确认修改</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from './utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const isLoggedIn = ref(!!localStorage.getItem('token'))
const userRole = ref(localStorage.getItem('role') || 'user')
const activeMenu = ref('home')
const loginForm = ref({ username: '', password: '' })

// 登录
const handleLogin = () => {
  request.post('/api/user/login', loginForm.value).then(res => {
    if (res.code === 200) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      userRole.value = res.data.role
      ElMessage.success('登录成功！')
      isLoggedIn.value = true
      activeMenu.value = 'home'
      fetchCourses()
      fetchKnowledgeList()
    } else { ElMessage.error(res.msg) }
  })
}

// 退出
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  isLoggedIn.value = false
  userRole.value = 'user'
}

// 注册
const isRegister = ref(false)
const toggleLoginRegister = () => {
  isRegister.value = !isRegister.value
  loginForm.value = { username: '', password: '', confirmPassword: '' }
}
const handleRegister = () => {
  if (!loginForm.value.username || !loginForm.value.password) return ElMessage.warning('用户名或密码不能为空')
  if (loginForm.value.password !== loginForm.value.confirmPassword) return ElMessage.warning('两次输入的密码不一致！')
  request.post('/api/user/register', loginForm.value).then(res => {
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录！')
      isRegister.value = false
      loginForm.value = { username: '', password: '', confirmPassword: '' }
    } else { ElMessage.error(res.msg) }
  })
}

// 修改密码
const pwdDialogVisible = ref(false)
const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const openPwdDialog = () => {
  pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  pwdDialogVisible.value = true
}
const submitUpdatePwd = () => {
  if (!pwdForm.value.oldPassword || !pwdForm.value.newPassword) return ElMessage.warning('密码不能为空')
  if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) return ElMessage.warning('两次输入的新密码不一致！')
  request.put('/api/user/updatePassword', { oldPassword: pwdForm.value.oldPassword, newPassword: pwdForm.value.newPassword }).then(res => {
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录！')
      pwdDialogVisible.value = false
      handleLogout()
    } else { ElMessage.error(res.msg) }
  })
}

// 忘记密码
const forgotPwdVisible = ref(false)
const forgotForm = ref({ username: '', code: '', newPassword: '', confirmPassword: '' })
const countdown = ref(0)
const openForgotPwdDialog = () => {
  forgotForm.value = { username: '', newPassword: '', confirmPassword: '' }
  forgotPwdVisible.value = true
}
// 发送验证码
const sendCode = () => {
  if (!forgotForm.value.username) return ElMessage.warning('请先输入用户名')
  request.post('/api/user/sendCode', { username: forgotForm.value.username }).then(res => {
    if (res.code === 200) {
      ElMessage.success('验证码已发送，请在 IDEA 控制台查看！')
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {
      ElMessage.error(res.msg)
    }
  })
}
// 提交重置密码
const submitForgotPwd = () => {
  if (!forgotForm.value.username || !forgotForm.value.code || !forgotForm.value.newPassword) {
    return ElMessage.warning('用户名、验证码和新密码不能为空')
  }
  if (forgotForm.value.newPassword !== forgotForm.value.confirmPassword) {
    return ElMessage.warning('两次输入的密码不一致！')
  }
  request.post('/api/user/resetPassword', {
    username: forgotForm.value.username,
    code: forgotForm.value.code, // 👈 新增：将验证码传给后端
    newPassword: forgotForm.value.newPassword
  }).then(res => {
    if (res.code === 200) {
      ElMessage.success('密码重置成功，请用新密码登录！')
      forgotPwdVisible.value = false
    } else {
      ElMessage.error(res.msg)
    }
  })
}
const handleSelect = (index) => { activeMenu.value = index }

// 详情弹窗与评论
const detailVisible = ref(false)
const currentDetail = ref({})
const openDetail = (item) => {
  currentDetail.value = item
  detailVisible.value = true
  fetchComments(item.id)
}
const comments = ref([])
const newComment = ref('')
const fetchComments = (knowledgeId) => { request.get('/api/comment/list/' + knowledgeId).then(res => { if (res.code === 200) comments.value = res.data }) }
const submitComment = () => {
  if (!newComment.value.trim()) return ElMessage.warning('评论内容不能为空')
  const payload = { knowledgeId: currentDetail.value.id, content: newComment.value }
  request.post('/api/comment/add', payload).then(res => {
    if (res.code === 200) {
      ElMessage.success('评论成功')
      newComment.value = ''
      fetchComments(currentDetail.value.id)
    }
  })
}

// 课程逻辑
const courses = ref([])
const dialogVisible = ref(false)
const form = ref({ name: '', description: '' })
const editId = ref(null)
const fetchCourses = () => { request.get('/api/course/list').then(res => { if (res.code === 200) courses.value = res.data }) }
const openDialog = () => { form.value = { name: '', description: '' }; editId.value = null; dialogVisible.value = true }
const handleEdit = (row) => { form.value = { name: row.name, description: row.description }; editId.value = row.id; dialogVisible.value = true }
const submitForm = () => {
  if (editId.value) {
    form.value.id = editId.value
    request.put('/api/course/update', form.value).then(res => { if (res.code === 200) { ElMessage.success('修改成功'); dialogVisible.value = false; fetchCourses() } })
  } else {
    request.post('/api/course/add', form.value).then(res => { if (res.code === 200) { ElMessage.success('新增成功'); dialogVisible.value = false; fetchCourses() } })
  }
}
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除吗?', '警告', { type: 'warning' }).then(() => {
    request.delete('/api/course/delete/' + row.id).then(res => { if (res.code === 200) { ElMessage.success('删除成功'); fetchCourses() } })
  })
}

// 知识点逻辑
const knowledgeList = ref([])
const knowledgeDialogVisible = ref(false)
const knowledgeForm = ref({ title: '', content: '' })
const fetchKnowledgeList = () => { request.get('/api/knowledge/list').then(res => { if (res.code === 200) knowledgeList.value = res.data }) }
const openKnowledgeDialog = () => { knowledgeForm.value = { title: '', content: '' }; knowledgeDialogVisible.value = true }
const submitKnowledge = () => {
  request.post('/api/knowledge/add', knowledgeForm.value).then(res => {
    if (res.code === 200) { ElMessage.success('发布成功'); knowledgeDialogVisible.value = false; fetchKnowledgeList() }
  })
}
const handleDeleteKnowledge = (row) => {
  ElMessageBox.confirm('确认删除吗?', '警告', { type: 'warning' }).then(() => {
    request.delete('/api/knowledge/delete/' + row.id).then(res => { if (res.code === 200) { ElMessage.success('删除成功'); fetchKnowledgeList() } })
  })
}

onMounted(() => { if (isLoggedIn.value) { fetchCourses(); fetchKnowledgeList() } })
</script>