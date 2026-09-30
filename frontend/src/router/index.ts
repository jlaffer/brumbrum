import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ReservationsView from '../views/ReservationsView.vue';
import MyCarsView from '../views/MyCarsView.vue';
import NeighborsView from '../views/NeighborsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/reservations',
      name: 'reservations',
      component: ReservationsView,
    },
    {
      path: '/my-cars',
      name: 'my-cars',
      component: MyCarsView,
    },
    {
      path: '/neighbors',
      name: 'neighbors',
      component: NeighborsView,
    },
  ],
});

export default router;
