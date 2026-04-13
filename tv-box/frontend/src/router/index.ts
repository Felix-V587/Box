import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '@/views/SearchView.vue'
import SourceView from '@/views/SourceView.vue'
import DetailView from '@/views/DetailView.vue'
import RecordView from '@/views/RecordView.vue'
import CollectView from '@/views/CollectView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/sources',
      name: 'sources',
      component: SourceView,
    },
    {
      path: '/detail',
      name: 'detail',
      component: DetailView,
    },
    {
      path: '/record',
      name: 'record',
      component: RecordView,
    },
    {
      path: '/collect',
      name: 'collect',
      component: CollectView,
    },
  ],
})

export default router
