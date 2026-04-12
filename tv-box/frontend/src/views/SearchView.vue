<template>
  <div class="search-view">
    <h1>视频搜索</h1>
    
    <!-- 搜索框 -->
    <div class="search-box">
      <el-input
        v-model="keyword"
        placeholder="输入关键词搜索"
        size="large"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch" :loading="searchStore.loading">
            搜索
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 搜索历史 -->
    <div class="search-history" v-if="searchStore.history.length > 0">
      <h3>搜索历史</h3>
      <el-tag
        v-for="item in searchStore.history"
        :key="item.id"
        @click="keyword = item.keyword; handleSearch()"
        style="margin-right: 8px; cursor: pointer;"
      >
        {{ item.keyword }}
      </el-tag>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="searchStore.results.length > 0">
      <h3>搜索结果 ({{ searchStore.total }} 条，耗时 {{ searchStore.searchTime }}ms)</h3>
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in searchStore.results" :key="item.vodId">
          <el-card :body-style="{ padding: '0px' }" style="margin-bottom: 20px;">
            <img :src="item.vodPic" style="width: 100%; height: 200px; object-fit: cover;" />
            <div style="padding: 14px;">
              <div class="video-name">{{ item.vodName }}</div>
              <div class="video-remarks">{{ item.vodRemarks }}</div>
              <div class="video-source">{{ item.sourceName }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSearchStore } from '@/stores/search'

const searchStore = useSearchStore()
const keyword = ref('')

const handleSearch = async () => {
  if (!keyword.value.trim()) return
  
  await searchStore.search({
    keyword: keyword.value,
    page: 1,
    pageSize: 20,
  })
}

onMounted(() => {
  searchStore.fetchHistory()
})
</script>

<style scoped>
.search-view {
  padding: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.search-history {
  margin-bottom: 20px;
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

.video-source {
  font-size: 12px;
  color: #666;
}
</style>
