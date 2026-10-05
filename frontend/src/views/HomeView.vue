<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { getCars, getReservations, createReservation, socket } from '../api/index';
import type { Car, Reservation } from '../types/index';
import { message } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CheckOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons-vue';

const props = defineProps<{ currentUserId: number | null }>();

const cars = ref<Car[]>([]);
const reservations = ref<Reservation[]>([]);
const loading = ref(false);
const isModalVisible = ref(false);
const selectedCar = ref<Car | null>(null);
const reservationRange = ref<[Dayjs, Dayjs] | null>(null);
const viewMode = ref<'list' | 'calendar'>(localStorage.getItem('brumbrum_home_view_mode') as 'list' | 'calendar' || 'list');
const calendarDate = ref<Dayjs>(dayjs(localStorage.getItem('brumbrum_home_calendar_date') || undefined));
const storedIds = localStorage.getItem('brumbrum_selected_car_ids');
const selectedCarIds = ref<number[]>(storedIds ? JSON.parse(storedIds) : []);
const isFirstLoad = ref(!storedIds);

watch(viewMode, (val) => {
  localStorage.setItem('brumbrum_home_view_mode', val);
});

watch(calendarDate, (val) => {
  localStorage.setItem('brumbrum_home_calendar_date', val.toISOString());
});

watch(selectedCarIds, (val) => {
  localStorage.setItem('brumbrum_selected_car_ids', JSON.stringify(val));
}, { deep: true });
const isDesktop = ref(window.innerWidth > 768);
const getYearOptions = (value: Dayjs) => {
  const year = value.year();
  const years = [];
  for (let i = year - 10; i <= year + 10; i += 1) {
    years.push(i);
  }
  return years;
};

const getMonthOptions = () => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    months.push(dayjs().month(i).format('MMMM'));
  }
  return months;
};

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

const activeCars = computed(() => cars.value.filter(c => c.isActive));

watch(activeCars, (newCars) => {
  if (isFirstLoad.value && newCars.length > 0) {
    selectedCarIds.value = newCars.map(c => c.id);
    isFirstLoad.value = false;
  }
}, { immediate: true });

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
  const day = value.startOf('day');
  return reservations.value.filter(res => {
    const start = dayjs(res.startTime).startOf('day');
    const end = dayjs(res.endTime).startOf('day');
    const isSelectedCar = res.car && selectedCarIds.value.includes(res.car.id);
    return isSelectedCar && !day.isBefore(start) && !day.isAfter(end) && res.status !== 'REJECTED';
  }).map(res => {
    const start = dayjs(res.startTime);
    const end = dayjs(res.endTime);
    const isStart = start.isSame(day, 'day');
    const isEnd = end.isSame(day, 'day');
    
    let timeStr = '';
    if (isStart && isEnd) {
      timeStr = `${start.format('HH:mm')}-${end.format('HH:mm')} `;
    } else if (isStart) {
      timeStr = `ab ${start.format('HH:mm')} `;
    } else if (isEnd) {
      timeStr = `bis ${end.format('HH:mm')} `;
    }

    return {
      id: res.id,
      color: res.car?.owner?.color || '#1890ff',
      status: res.status,
      content: `${timeStr}${res.car?.licensePlate}`,
      isStart,
      isEnd
    };
  });
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
      <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }" :data-source="activeCars" :loading="loading">
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
      <div class="filter-container">
        <span class="filter-label">Fahrzeuge filtern:</span>
        <a-checkbox-group v-model:value="selectedCarIds">
          <a-config-provider
            v-for="car in activeCars"
            :key="car.id"
            :theme="{
              token: {
                colorPrimary: car.owner?.color || '#1890ff',
              }
            }"
          >
            <a-checkbox :value="car.id" :style="{ color: car.owner?.color }">
              {{ car.licensePlate }}
            </a-checkbox>
          </a-config-provider>
        </a-checkbox-group>
      </div>
      <a-calendar v-model:value="calendarDate" :fullscreen="isDesktop">
        <template #headerRender="{ value, type, onChange, onTypeChange }">
          <div style="padding: 10px; display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
            <a-select
              size="small"
              style="width: 100px"
              :dropdown-match-select-width="false"
              :value="value.year()"
              @change="(newYear: number) => onChange(value.year(newYear))"
            >
              <a-select-option v-for="val in getYearOptions(value)" :key="val" :value="val">
                {{ val }}
              </a-select-option>
            </a-select>

            <a-select
              v-if="type === 'month'"
              size="small"
              style="width: 120px"
              :dropdown-match-select-width="false"
              :value="value.month()"
              @change="(newMonth: number) => onChange(value.month(newMonth))"
            >
              <a-select-option v-for="(month, index) in getMonthOptions()" :key="index" :value="index">
                {{ month }}
              </a-select-option>
            </a-select>

            <a-button size="small" @click="onChange(value.subtract(1, type === 'month' ? 'month' : 'year'))">
              <template #icon><LeftOutlined /></template>
            </a-button>

            <a-button size="small" @click="onChange(value.add(1, type === 'month' ? 'month' : 'year'))">
              <template #icon><RightOutlined /></template>
            </a-button>

            <a-radio-group :value="type" button-style="solid" size="small" @change="(e: any) => onTypeChange(e.target.value)">
              <a-radio-button value="month">Monat</a-radio-button>
              <a-radio-button value="year">Jahr</a-radio-button>
            </a-radio-group>
          </div>
        </template>
        <template #dateCellRender="{ current }">
          <div class="events-container" v-if="isDesktop">
            <div 
              v-for="item in getListData(current)" 
              :key="item.id" 
              class="event-item"
              :class="{ 'event-start': item.isStart, 'event-end': item.isEnd }"
              :style="{ backgroundColor: item.color + '22', borderLeft: `3px solid ${item.color}` }"
            >
              <span class="event-content" :style="{ color: item.color }">
                <ClockCircleOutlined v-if="item.status === 'PENDING'" />
                <CheckCircleOutlined v-else-if="item.status === 'APPROVED'" />
                <CheckOutlined v-else-if="item.status === 'COMPLETED'" />
                {{ item.content }}
              </span>
            </div>
          </div>
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
  text-align: left;
}
.filter-container {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-label {
  font-weight: 600;
  color: var(--text-h);
}
.events-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.event-item {
  padding: 2px 4px;
  font-size: 11px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  border-radius: 2px;
}
.event-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.event-start {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.event-end {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
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
