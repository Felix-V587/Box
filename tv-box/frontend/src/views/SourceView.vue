<template>
  <div class="source-view">
    <h1>数据源管理</h1>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加数据源
      </el-button>
      <el-upload
        :show-file-list="false"
        :before-upload="handleUpload"
        accept=".json,.txt"
        style="margin-left: 12px;"
      >
        <el-button type="success">
          <el-icon><Upload /></el-icon>
          导入配置文件
        </el-button>
      </el-upload>
      <el-button @click="handleRefresh" :loading="sourceStore.loading">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 数据源列表 -->
    <el-table
      :data="sourceStore.sources"
      v-loading="sourceStore.loading"
      style="width: 100%; margin-top: 20px;"
      border
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="sourceKey" label="标识" width="150" />
      <el-table-column prop="sourceName" label="名称" width="200" />
      <el-table-column prop="sourceType" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getSourceTypeTag(row.sourceType)">
            {{ getSourceTypeText(row.sourceType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="spiderType" label="Spider类型" width="100">
        <template #default="{ row }">
          {{ row.spiderType || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="sourceUrl" label="URL" show-overflow-tooltip />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleTest(row)">
            测试
          </el-button>
          <el-button size="small" type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="sourceStore.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end;"
      @size-change="handleRefresh"
      @current-change="handleRefresh"
    />

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑数据源' : '添加数据源'"
      width="600px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标识" prop="sourceKey">
          <el-input v-model="formData.sourceKey" placeholder="请输入唯一标识" />
        </el-form-item>
        <el-form-item label="名称" prop="sourceName">
          <el-input v-model="formData.sourceName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="类型" prop="sourceType">
          <el-select v-model="formData.sourceType" placeholder="请选择类型">
            <el-option label="XML" :value="0" />
            <el-option label="JSON" :value="1" />
            <el-option label="Spider" :value="3" />
            <el-option label="扩展" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="Spider类型" prop="spiderType" v-if="formData.sourceType === 3">
          <el-select v-model="formData.spiderType" placeholder="请选择Spider类型">
            <el-option label="JAR" value="jar" />
            <el-option label="JavaScript" value="js" />
            <el-option label="Python" value="py" />
          </el-select>
        </el-form-item>
        <el-form-item label="URL" prop="sourceUrl">
          <el-input v-model="formData.sourceUrl" placeholder="请输入URL" />
        </el-form-item>
        <el-form-item label="Spider内容" prop="spiderContent" v-if="formData.sourceType === 3">
          <el-input
            v-model="formData.spiderContent"
            type="textarea"
            :rows="10"
            placeholder="请输入Spider代码"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type UploadProps } from 'element-plus'
import { Plus, Upload, Refresh } from '@element-plus/icons-vue'
import { useSourceStore } from '@/stores/source'
import { sourceApi } from '@/api'
import type { Source } from '@/types'

const sourceStore = useSourceStore()
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

const formData = reactive<Partial<Source>>({
  sourceKey: '',
  sourceName: '',
  sourceType: 0,
  spiderType: '',
  sourceUrl: '',
  spiderContent: '',
  status: 1,
})

const rules = {
  sourceKey: [{ required: true, message: '请输入标识', trigger: 'blur' }],
  sourceName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  sourceType: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

// 获取数据源类型文本
const getSourceTypeText = (type: number) => {
  const types = ['XML', 'JSON', '', 'Spider', '扩展']
  return types[type] || '未知'
}

// 获取数据源类型标签
const getSourceTypeTag = (type: number) => {
  const tags: Record<number, string> = {
    0: 'info',
    1: 'success',
    3: 'warning',
    4: 'danger',
  }
  return tags[type] || 'info'
}

// 刷新列表
const handleRefresh = async () => {
  await sourceStore.fetchSources({
    page: currentPage.value,
    pageSize: pageSize.value,
  })
}

// 添加数据源
const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    sourceKey: '',
    sourceName: '',
    sourceType: 0,
    spiderType: '',
    sourceUrl: '',
    spiderContent: '',
    status: 1,
  })
  dialogVisible.value = true
}

// 编辑数据源
const handleEdit = (row: Source) => {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // 准备提交数据，非 Spider 类型清空相关字段
      const submitData = { ...formData }
      if (submitData.sourceType !== 3) {
        submitData.spiderType = ''
        submitData.spiderContent = ''
      }

      if (isEdit.value && submitData.id) {
        await sourceApi.update(submitData.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await sourceApi.create(submitData)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      handleRefresh()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 删除数据源
const handleDelete = async (row: Source) => {
  try {
    await ElMessageBox.confirm('确定要删除该数据源吗？', '提示', {
      type: 'warning',
    })
    await sourceStore.deleteSource(row.id)
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 状态变更
const handleStatusChange = async (row: Source) => {
  try {
    await sourceStore.updateStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败')
    row.status = row.status === 1 ? 0 : 1 // 恢复原状态
  }
}

// 测试连接
const handleTest = async (row: Source) => {
  try {
    const res = await sourceApi.testConnection(row.id)
    if (res.data.success) {
      ElMessage.success('连接成功')
    } else {
      ElMessage.error(res.data.message || '连接失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '测试失败')
  }
}

// 上传配置文件
const handleUpload: UploadProps['beforeUpload'] = async (file) => {
  try {
    const res = await sourceApi.uploadConfig(file)
    ElMessage.success(`成功导入 ${res.data.loadedCount} 个数据源`)
    handleRefresh()
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  }
  return false // 阻止默认上传行为
}

onMounted(() => {
  handleRefresh()
})
</script>

<style scoped>
.source-view {
  padding: 20px;
}

.action-bar {
  display: flex;
  align-items: center;
}
</style>
