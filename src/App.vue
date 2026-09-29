<template>
  <div style="padding: 20px;">
    <h1>课程列表（全栈联调实战）</h1>
    <ul>
      <li v-for="course in courses" :key="course.id" style="margin-bottom: 10px;">
        <strong>{{ course.name }}</strong> - {{ course.description }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 定义响应式数组，用来存后端返回的数据
const courses = ref([])

// 页面加载后立刻向后端发送请求
onMounted(() => {
  axios.get('http://localhost:8080/api/course/list')
    .then(response => {
      // 把后端返回的JSON数据赋值给 courses 变量
      courses.value = response.data
    })
    .catch(error => {
      console.error("请求后端失败了：", error)
    })
})
</script>