<template>
  <div style="padding: 20px; width: 800px; margin: 0 auto;">
    <h2>课程管理后台</h2>
    
    <!-- 新增按钮 -->
    <el-button type="primary" @click="openDialog" style="margin-bottom: 20px;">
      新增课程
    </el-button>

    <!-- 课程列表表格 -->
    <el-table :data="courses" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="description" label="课程描述" />
    </el-table>

    <!-- 新增课程的弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增课程" width="400px">
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
          <el-button type="primary" @click="submitForm">确认新增</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const courses = ref([])
const dialogVisible = ref(false)

// 表单绑定的数据
const form = ref({
  name: '',
  description: ''
})

// 获取课程列表
const fetchCourses = () => {
  axios.get('http://localhost:8080/api/course/list')
    .then(response => {
      courses.value = response.data
    })
    .catch(error => {
      console.error("查询失败：", error)
    })
}

// 页面加载时执行
onMounted(() => {
  fetchCourses()
})

// 打开弹窗
const openDialog = () => {
  form.value = { name: '', description: '' } // 清空表单
  dialogVisible.value = true
}

// 提交新增表单
const submitForm = () => {
  axios.post('http://localhost:8080/api/course/add', form.value)
    .then(response => {
      ElMessage.success('新增成功！')
      dialogVisible.value = false // 关闭弹窗
      fetchCourses() // 重新刷新列表
    })
    .catch(error => {
      ElMessage.error('新增失败，请检查后端是否启动')
      console.error(error)
    })
}
</script>