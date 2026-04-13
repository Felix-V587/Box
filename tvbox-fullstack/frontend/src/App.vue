<template>
  <div id="app">
    <el-container>
      <el-header>
        <h1>TVBox 视频搜索系统</h1>
      </el-header>

      <el-main>
        <!-- 配置加载 -->
        <el-card class="config-card" v-if="!configLoaded">
          <template #header>
            <span>配置加载</span>
          </template>
          <el-form :inline="true">
            <el-form-item label="配置地址">
              <el-input v-model="configUrl" placeholder="请输入配置地址" style="width: 500px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadConfig" :loading="loading">加载配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 搜索 -->
        <el-card class="search-card" v-if="configLoaded">
          <template #header>
            <span>视频搜索</span>
          </template>
          <el-form :inline="true">
            <el-form-item label="搜索关键词">
              <el-input v-model="searchKeyword" placeholder="请输入搜索关键词" @keyup.enter="search" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="search" :loading="searching">搜索</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 搜索结果 -->
        <el-card class="result-card" v-if="searchResults.length > 0">
          <template #header>
            <span>搜索结果 (共 {{ searchResults.length }} 个)</span>
          </template>
          <el-table :data="searchResults" style="width: 100%">
            <el-table-column prop="siteName" label="站点" width="200" />
            <el-table-column prop="vod_name" label="视频名称" width="200" />
            <el-table-column prop="vod_remarks" label="备注" width="150" />
            <el-table-column prop="vod_year" label="年份" width="100" />
            <el-table-column prop="vod_type" label="类型" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="getPlayInfo(scope.row)">获取播放地址</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 播放信息 -->
        <el-card class="play-card" v-if="playInfo">
          <template #header>
            <span>{{ playInfo.videoName }} - 播放线路</span>
          </template>
          <el-tabs v-model="activeSource">
            <el-tab-pane
              v-for="(source, index) in playInfo.sources"
              :key="index"
              :label="source.name"
              :name="String(index)"
            >
              <el-table :data="source.episodes" style="width: 100%">
                <el-table-column prop="name" label="剧集" width="150" />
                <el-table-column label="类型" width="100">
                  <template #default="scope">
                    <el-tag v-if="scope.row.isM3U8" type="success">M3U8</el-tag>
                    <el-tag v-else-if="scope.row.isMP4" type="primary">MP4</el-tag>
                    <el-tag v-else type="info">其他</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="url" label="播放地址" />
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button size="small" type="primary" @click="playVideo(scope.row)">播放</el-button>
                    <el-button size="small" @click="copyUrl(scope.row.url)">复制</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export default {
  name: 'App',
  setup() {
    const configUrl = ref('http://www.饭太硬.com/tv')
    const configLoaded = ref(false)
    const loading = ref(false)
    const searchKeyword = ref('')
    const searching = ref(false)
    const searchResults = ref([])
    const playInfo = ref(null)
    const activeSource = ref('0')

    const loadConfig = async () => {
      loading.value = true
      try {
        const response = await axios.post('/api/config/load', {
          url: configUrl.value
        })

        if (response.data.success) {
          configLoaded.value = true
          ElMessage.success('配置加载成功')
        } else {
          ElMessage.error(response.data.error || '配置加载失败')
        }
      } catch (error) {
        ElMessage.error('配置加载失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    const search = async () => {
      if (!searchKeyword.value) {
        ElMessage.warning('请输入搜索关键词')
        return
      }

      searching.value = true
      try {
        const response = await axios.post('/api/search', {
          keyword: searchKeyword.value
        })

        if (response.data.success) {
          const result = response.data.data
          searchResults.value = []

          // Flatten results
          result.results.forEach(siteResult => {
            siteResult.videos.forEach(video => {
              searchResults.value.push({
                siteKey: siteResult.siteKey,
                siteName: siteResult.siteName,
                ...video
              })
            })
          })

          ElMessage.success(`搜索完成，共找到 ${result.totalVideos} 个结果`)
        } else {
          ElMessage.error(response.data.error || '搜索失败')
        }
      } catch (error) {
        ElMessage.error('搜索失败: ' + error.message)
      } finally {
        searching.value = false
      }
    }

    const getPlayInfo = async (video) => {
      try {
        const response = await axios.post('/api/player/info', {
          siteKey: video.siteKey,
          siteName: video.siteName,
          videoId: video.vod_id,
          videoName: video.vod_name
        })

        if (response.data.success) {
          playInfo.value = response.data.data
          activeSource.value = '0'
          ElMessage.success('播放信息获取成功')
        } else {
          ElMessage.error(response.data.error || '获取播放信息失败')
        }
      } catch (error) {
        ElMessage.error('获取播放信息失败: ' + error.message)
      }
    }

    const playVideo = (episode) => {
      // Open video in new window or use video player
      window.open(episode.url, '_blank')
    }

    const copyUrl = (url) => {
      navigator.clipboard.writeText(url)
      ElMessage.success('播放地址已复制')
    }

    return {
      configUrl,
      configLoaded,
      loading,
      searchKeyword,
      searching,
      searchResults,
      playInfo,
      activeSource,
      loadConfig,
      search,
      getPlayInfo,
      playVideo,
      copyUrl
    }
  }
}
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  color: #333;
}

.el-header {
  background-color: #409EFF;
  color: white;
  text-align: center;
  line-height: 60px;
}

.el-header h1 {
  margin: 0;
  font-size: 24px;
}

.el-main {
  padding: 20px;
}

.config-card,
.search-card,
.result-card,
.play-card {
  margin-bottom: 20px;
}
</style>
