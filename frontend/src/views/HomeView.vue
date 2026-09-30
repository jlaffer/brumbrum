<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getCars, getReservations, createReservation, socket } from '../api/index';
import type { Car, Reservation } from '../types/index';
import { message } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CheckOutlined 
} from '@ant-design/icons-vue';

const props = defineProps<{ currentUserId: number | null }>();

const cars = ref<Car[]>([]);
const reservations = ref<Reservation[]>([]);
const loading = ref(false);
const isModalVisible = ref(false);
const selectedCar = ref<Car | null>(null);
const reservationRange = ref<[Dayjs, Dayjs] | null>(null);
const viewMode = ref<'list' | 'calendar'>('list');
const isDesktop = ref(window.innerWidth > 768);

const updateWidth = () => {
  isDesktop.value = window.innerWidth > 768;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [carsData, resData] = await Promise.all([getCars(), getReservations()]);
    cars.value = carsData;
    reservations.value = resData;
  } catch (e) {
    message.error('Fehler beim Laden der Daten');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', updateWidth);
  socket.on('carUpdate', fetchData);
  socket.on('reservationUpdate', fetchData);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
  socket.off('carUpdate', fetchData);
  socket.off('reservationUpdate', fetchData);
});

const getListData = (value: Dayjs) => {
  return reservations.value.filter(res => 
    dayjs(res.startTime).isSame(value, 'day') && res.status !== 'REJECTED'
  ).map(res => ({
    color: res.user?.color || '#1890ff',
    status: res.status,
    content: `${res.user?.name || '?'}: ${res.car?.brand || 'Auto'}`,
  }));
};

const showReservationModal = (car: Car) => {
  selectedCar.value = car;
  isModalVisible.value = true;
};

const handleOk = async () => {
  if (!props.currentUserId || !selectedCar.value || !reservationRange.value) {
    message.warning('Bitte alle Felder ausfüllen');
    return;
  }

  try {
    await createReservation({
      carId: selectedCar.value.id,
      userId: props.currentUserId,
      startTime: reservationRange.value[0].toISOString(),
      endTime: reservationRange.value[1].toISOString(),
    });
    message.success('Reservierung angefragt');
    isModalVisible.value = false;
    reservationRange.value = null;
  } catch (e) {
    message.error('Fehler bei der Reservierung');
  }
};
</script>

<template>
  <div>
    <div class="view-header">
      <h2>Fahrzeugübersicht</h2>
      <a-radio-group v-model:value="viewMode" button-style="solid">
        <a-radio-button value="list">Liste</a-radio-button>
        <a-radio-button value="calendar">Kalender</a-radio-button>
      </a-radio-group>
    </div>

    <div v-if="viewMode === 'list'">
      <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }" :data-source="cars" :loading="loading">
        <template #renderItem="{ item }">
          <a-list-item style="padding: 0">
            <a-card :title="item.brand + ' ' + item.model" hoverable>
              <template #extra><a-tag color="blue">{{ item.licensePlate }}</a-tag></template>
              <p><strong>Kilometerstand:</strong> {{ item.currentMileage }} km</p>
              <p><strong>Besitzer:</strong> {{ item.owner?.name }}</p>
              <a-button type="primary" block @click="showReservationModal(item)">Reservieren</a-button>
            </a-card>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div v-else class="calendar-container">
      <a-calendar :fullscreen="isDesktop">
        <template #dateCellRender="{ current }">
          <ul class="events" v-if="isDesktop">
            <li v-for="item in getListData(current)" :key="item.content">
              <a-badge :color="item.color">
                <template #text>
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    <ClockCircleOutlined v-if="item.status === 'PENDING'" style="color: orange" />
                    <CheckCircleOutlined v-else-if="item.status === 'APPROVED'" style="color: green" />
                    <CheckOutlined v-else-if="item.status === 'COMPLETED'" style="color: blue" />
                    {{ item.content }}
                  </span>
                </template>
              </a-badge>
            </li>
          </ul>
        </template>
      </a-calendar>
    </div>

    <a-modal v-model:open="isModalVisible" title="Fahrzeug reservieren" @ok="handleOk">
      <div v-if="selectedCar">
        <p>Fahrzeug: {{ selectedCar.brand }} {{ selectedCar.model }}</p>
        <p>Zeitraum wählen:</p>
        <a-range-picker
          v-model:value="reservationRange"
          show-time
          format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        />
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.calendar-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
.events {
  list-style: none;
  margin: 0;
  padding: 0;
}
.events :deep(.ant-badge-status) {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-overflow: ellipsis;
  font-size: 12px;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .calendar-container {
    padding: 10px;
  }
}
</style>
