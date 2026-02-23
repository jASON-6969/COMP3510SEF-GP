import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SampleLoginView from '../views/SampleLoginView.vue';
import ReportLostView from '../views/ReportLostView.vue';
import ReportFoundView from '../views/ReportFoundView.vue';
import ItemsListView from '../views/ItemsListView.vue';
import ItemDetailView from '../views/ItemDetailView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: SampleLoginView,
  },
  {
    path: '/report-lost',
    name: 'report-lost',
    component: ReportLostView,
  },
  {
    path: '/report-found',
    name: 'report-found',
    component: ReportFoundView,
  },
  {
    path: '/items',
    name: 'items',
    component: ItemsListView,
  },
  {
    path: '/items/:id',
    name: 'item-detail',
    component: ItemDetailView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;


