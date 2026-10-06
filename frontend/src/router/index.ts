import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import CarsView from '../views/CarsView.vue';
import ReservationsView from '../views/ReservationsView.vue';
import MyCarsView from '../views/MyCarsView.vue';
import NeighborsView from '../views/NeighborsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/cars',
      name: 'cars',
      component: CarsView,
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
