<template>
  <div class="collect-view">
    <h1>我的收藏</h1>

    <el-row :gutter="20" v-loading="loading">
      <el-col :span="6" v-for="item in collects" :key="item.id">
        <el-card :body-style="{ padding: '0px' }" style="margin-bottom: 20px;">
          <img :src="item.vodPic || '/placeholder.svg'" style="width: 100%; height: 200px; object-fit: cover;" @error="handleImageError" />
          <div style="padding: 14px;">
            <div class="video-name">{{ item.vodName }}</div>
            <div class="video-remarks">{{ item.vodRemarks }}</div>
            <div class="video-time">{{ formatTime(item.createTime) }}</div>
            <div class="actions">
              <el-button size="small" type="primary" @click="handlePlay(item)">
                播放
              </el-button>
              <el-button size="small" type="danger" @click="handleRemove(item)">
                取消收藏
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && collects.length === 0" description="暂无收藏" />

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[8, 16, 32, 48]"
      layout="total, sizes, prev, pager, next"
      style="margin-top: 20px; justify-content: flex-end;"
      @size-change="fetchCollects"
      @current-change="fetchCollects"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { playerApi } from '@/api'
import type { VodCollect } from '@/types'

const router = useRouter()

const loading = ref(false)
const collects = ref<VodCollect[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(16)

// 获取收藏列表
const fetchCollects = async () => {
  loading.value = true
  try {
    const res = await playerApi.getCollects({
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    collects.value = res.data.list
    total.value = res.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取收藏失败')
  } finally {
    loading.value = false
  }
}

// 播放
const handlePlay = (item: VodCollect) => {
  router.push({
    name: 'detail',
    query: {
      sourceKey: item.sourceKey,
      vodId: item.vodId,
    },
  })
}

// 取消收藏
const handleRemove = async (item: VodCollect) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
      type: 'warning',
    })
    await playerApi.removeCollect(item.id)
    ElMessage.success('已取消收藏')
    fetchCollects()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 格式化时间
const formatTime = (time: Date) => {
  return new Date(time).toLocaleDateString('zh-CN')
}

// 图片加载失败
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

onMounted(() => {
  fetchCollects()
})
</script>

<style scoped>
.collect-view {
  padding: 20px;
}

.video-name {
  font-weight: bold;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-remarks {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.video-time {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
