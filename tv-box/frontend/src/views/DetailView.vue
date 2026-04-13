<template>
  <div class="detail-view">
    <el-page-header @back="goBack" content="视频详情" />

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="detail" class="detail-content">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <div class="video-info">
          <img :src="detail.vodPic || '/placeholder.svg'" class="poster" @error="handleImageError" />
          <div class="info-text">
            <h2>{{ detail.vodName }}</h2>
            <p v-if="detail.vodRemarks" class="remarks">{{ detail.vodRemarks }}</p>
            <p v-if="detail.vodDirector"><strong>导演：</strong>{{ detail.vodDirector }}</p>
            <p v-if="detail.vodActor"><strong>演员：</strong>{{ detail.vodActor }}</p>
            <p v-if="detail.vodArea"><strong>地区：</strong>{{ detail.vodArea }}</p>
            <p v-if="detail.vodYear"><strong>年份：</strong>{{ detail.vodYear }}</p>
            <p v-if="detail.vodContent" class="content">{{ detail.vodContent }}</p>
          </div>
        </div>
      </el-card>

      <!-- 播放线路 -->
      <el-card v-if="detail.series && detail.series.length > 0" class="series-card">
        <template #header>
          <div class="card-header">
            <span>播放线路</span>
            <el-button-group>
              <el-button
                v-for="(series, index) in detail.series"
                :key="index"
                :type="currentSeriesIndex === index ? 'primary' : 'default'"
                @click="currentSeriesIndex = index"
              >
                {{ series.name }}
              </el-button>
            </el-button-group>
          </div>
        </template>

        <!-- 剧集列表 -->
        <div v-if="currentSeries" class="episodes">
          <el-button
            v-for="(episode, index) in currentSeries.episodes"
            :key="index"
            :type="currentEpisodeIndex === index ? 'primary' : 'default'"
            size="small"
            @click="handlePlayEpisode(index)"
          >
            {{ episode.name }}
          </el-button>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button type="primary" @click="handleCollect" :loading="collecting">
          {{ collected ? '取消收藏' : '收藏' }}
        </el-button>
      </div>
    </div>

    <el-empty v-else description="未找到视频信息" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { detailApi, playerApi } from '@/api'
import type { VodInfo, Series } from '@/types'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const detail = ref<VodInfo | null>(null)
const currentSeriesIndex = ref(0)
const currentEpisodeIndex = ref(-1)
const collected = ref(false)
const collecting = ref(false)

const currentSeries = computed(() => {
  if (detail.value?.series && detail.value.series.length > 0) {
    return detail.value.series[currentSeriesIndex.value]
  }
  return null
})

// 获取详情
const fetchDetail = async () => {
  const { sourceKey, vodId } = route.query
  if (!sourceKey || !vodId) {
    ElMessage.error('缺少必要参数')
    return
  }

  loading.value = true
  try {
    const res = await detailApi.getDetail(sourceKey as string, vodId as string)
    detail.value = res.data

    // 检查是否已收藏
    const collectRes = await playerApi.checkCollect(sourceKey as string, vodId as string)
    collected.value = collectRes.data.collected
  } catch (error: any) {
    ElMessage.error(error.message || '获取详情失败')
  } finally {
    loading.value = false
  }
}

// 播放剧集
const handlePlayEpisode = async (index: number) => {
  if (!currentSeries.value || !detail.value) return

  currentEpisodeIndex.value = index
  const episode = currentSeries.value.episodes[index]

  try {
    const res = await playerApi.parsePlayUrl({
      sourceKey: route.query.sourceKey as string,
      vodId: detail.value.vodId,
      flag: currentSeries.value.name,
      url: episode.url,
    })

    // 保存播放记录
    await playerApi.saveRecord({
      vodId: detail.value.vodId,
      vodName: detail.value.vodName,
      vodPic: detail.value.vodPic,
      sourceKey: route.query.sourceKey as string,
      episodeIndex: index,
    })

    // 跳转到播放页面
    router.push({
      name: 'play',
      query: {
        url: res.data.url,
        title: `${detail.value.vodName} - ${episode.name}`,
      },
    })
  } catch (error: any) {
    ElMessage.error(error.message || '解析播放地址失败')
  }
}

// 收藏/取消收藏
const handleCollect = async () => {
  if (!detail.value) return

  collecting.value = true
  try {
    if (collected.value) {
      // 取消收藏 - 需要先获取收藏ID
      const res = await playerApi.getCollects()
      const collect = res.data.list.find(
        (c) => c.vodId === detail.value!.vodId && c.sourceKey === route.query.sourceKey,
      )
      if (collect) {
        await playerApi.removeCollect(collect.id)
        collected.value = false
        ElMessage.success('已取消收藏')
      }
    } else {
      // 添加收藏
      await playerApi.addCollect({
        vodId: detail.value.vodId,
        vodName: detail.value.vodName,
        vodPic: detail.value.vodPic,
        sourceKey: route.query.sourceKey as string,
        vodRemarks: detail.value.vodRemarks,
      })
      collected.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    collecting.value = false
  }
}

// 图片加载失败
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.detail-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  padding: 40px;
}

.info-card {
  margin-bottom: 20px;
}

.video-info {
  display: flex;
  gap: 20px;
}

.poster {
  width: 200px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.info-text {
  flex: 1;
}

.info-text h2 {
  margin: 0 0 16px 0;
}

.info-text p {
  margin: 8px 0;
  line-height: 1.6;
}

.remarks {
  color: #409eff;
  font-size: 14px;
}

.content {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.series-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.episodes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
</style>
