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
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增课程的弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑课程' : '新增课程'" width="400px">
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
          <el-button type="primary" @click="submitForm">{{ isEdit ? '确认修改' : '确认新增' }}</el-button>
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
const isEdit = ref(false)

const form = ref({
  id: null,
  name: '',
  description: ''
})

// 获取课程列表
const fetchCourses = () => {
  axios.get('http://localhost:8080/api/course/list')
    .then(response => {
      courses.value = response.data.data
    })
    .catch(error => {
      console.error("查询失败：", error)
    })
}

// 页面加载时执行
onMounted(() => {
  fetchCourses()
})

const openDialog = () => {
  isEdit.value = false
  form.value = { id: null, name: '', description: '' }
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  form.value = { id: row.id, name: row.name, description: row.description }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  axios.delete('http://localhost:8080/api/course/delete/' + row.id)
    .then(() => {
      ElMessage.success('删除成功！')
      fetchCourses()
    })
    .catch(error => {
      ElMessage.error('删除失败')
      console.error(error)
    })
}

const submitForm = () => {
  if (isEdit.value) {
    axios.put('http://localhost:8080/api/course/update', form.value)
      .then(() => {
        ElMessage.success('修改成功！')
        dialogVisible.value = false
        fetchCourses()
      })
      .catch(error => {
        ElMessage.error('修改失败')
        console.error(error)
      })
  } else {
    axios.post('http://localhost:8080/api/course/add', form.value)
      .then(() => {
        ElMessage.success('新增成功！')
        dialogVisible.value = false
        fetchCourses()
      })
      .catch(error => {
        ElMessage.error('新增失败，请检查后端是否启动')
        console.error(error)
      })
  }
}
</script>