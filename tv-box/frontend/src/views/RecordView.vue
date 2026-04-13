<template>
  <div class="record-view">
    <h1>播放记录</h1>

    <el-table :data="records" v-loading="loading" border>
      <el-table-column label="视频" width="300">
        <template #default="{ row }">
          <div class="video-cell">
            <img :src="row.vodPic || '/placeholder.svg'" class="thumbnail" @error="handleImageError" />
            <div class="video-info">
              <div class="name">{{ row.vodName }}</div>
              <div class="time">{{ formatTime(row.updateTime) }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="episodeIndex" label="剧集" width="100">
        <template #default="{ row }">
          第 {{ (row.episodeIndex || 0) + 1 }} 集
        </template>
      </el-table-column>
      <el-table-column prop="playPosition" label="播放进度" width="150">
        <template #default="{ row }">
          {{ formatDuration(row.playPosition) }} / {{ formatDuration(row.duration) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleContinue(row)">
            继续播放
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      style="margin-top: 20px; justify-content: flex-end;"
      @size-change="fetchRecords"
      @current-change="fetchRecords"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { playerApi } from '@/api'
import type { VodRecord } from '@/types'

const router = useRouter()

const loading = ref(false)
const records = ref<VodRecord[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 获取播放记录
const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await playerApi.getRecords({
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    records.value = res.data.list
    total.value = res.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取记录失败')
  } finally {
    loading.value = false
  }
}

// 继续播放
const handleContinue = (row: VodRecord) => {
  router.push({
    name: 'detail',
    query: {
      sourceKey: row.sourceKey,
      vodId: row.vodId,
    },
  })
}

// 删除记录
const handleDelete = async (row: VodRecord) => {
  try {
    await ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
      type: 'warning',
    })
    await playerApi.deleteRecord(row.id)
    ElMessage.success('删除成功')
    fetchRecords()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 格式化时间
const formatTime = (time: Date) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 格式化时长
const formatDuration = (seconds?: number) => {
  if (!seconds) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// 图片加载失败
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.record-view {
  padding: 20px;
}

.video-cell {
  display: flex;
  gap: 12px;
  align-items: center;
}

.thumbnail {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.video-info {
  flex: 1;
}

.name {
  font-weight: bold;
  margin-bottom: 4px;
}

.time {
  font-size: 12px;
  color: #999;
}
</style>
