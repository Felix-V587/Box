<template>
  <el-container class="layout-container">
    <!-- 顶部导航 -->
    <el-header>
      <div class="header-content">
        <h1 class="logo">TVBox 管理系统</h1>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/">
            <el-icon><Search /></el-icon>
            <span>视频搜索</span>
          </el-menu-item>
          <el-menu-item index="/sources">
            <el-icon><Setting /></el-icon>
            <span>数据源管理</span>
          </el-menu-item>
          <el-menu-item index="/record">
            <el-icon><VideoPlay /></el-icon>
            <span>播放记录</span>
          </el-menu-item>
          <el-menu-item index="/collect">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main>
      <RouterView />
    </el-main>

    <!-- 底部 -->
    <el-footer>
      <p>TVBox Backend &copy; 2024</p>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Setting, VideoPlay, Star } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.el-header {
  background-color: #545c64;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  color: #fff;
  font-size: 20px;
  margin: 0;
  margin-right: 40px;
}

.el-menu {
  border-bottom: none;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.el-footer {
  background-color: #545c64;
  color: #fff;
  text-align: center;
  padding: 10px 20px;
}

.el-footer p {
  margin: 0;
  font-size: 14px;
}
</style>
