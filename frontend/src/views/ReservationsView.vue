<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getReservations, updateReservationStatus, completeReservation, getCars, updateReservation, socket } from '../api/index';
import { ReservationStatus } from '../types/index';
import type { Reservation, Car } from '../types/index';
import { message } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  EditOutlined,
  CheckOutlined
} from '@ant-design/icons-vue';

const props = defineProps<{ currentUserId: number | null }>();

const reservations = ref<Reservation[]>([]);
const loading = ref(false);
const mileageModalVisible = ref(false);
const editModalVisible = ref(false);
const selectedReservation = ref<Reservation | null>(null);
const cars = ref<Car[]>([]);
const editForm = ref({
  carId: undefined as number | undefined,
  range: null as [Dayjs, Dayjs] | null,
});
const endMileage = ref<number | null>(null);
const viewMode = ref<'list' | 'calendar'>('list');
const isDesktop = ref(window.innerWidth > 768);

const updateWidth = () => {
  isDesktop.value = window.innerWidth > 768;
};

const fetchReservations = async () => {
  loading.value = true;
  try {
    const [resData, carsData] = await Promise.all([getReservations(), getCars()]);
    reservations.value = resData;
    cars.value = carsData;
  } catch (e) {
    message.error('Fehler beim Laden der Reservierungen');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReservations();
  window.addEventListener('resize', updateWidth);
  socket.on('reservationUpdate', fetchReservations);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
  socket.off('reservationUpdate', fetchReservations);
});

const handleStatus = async (id: number, status: ReservationStatus) => {
  try {
    await updateReservationStatus(id, status);
    message.success(`Reservierung ${status === ReservationStatus.APPROVED ? 'bestätigt' : 'abgelehnt'}`);
  } catch (e) {
    message.error('Fehler beim Aktualisieren des Status');
  }
};

const openMileageModal = (res: Reservation) => {
  selectedReservation.value = res;
  endMileage.value = res.car.currentMileage;
  mileageModalVisible.value = true;
};

const openEditModal = (res: Reservation) => {
  selectedReservation.value = res;
  editForm.value = {
    carId: res.car.id,
    range: [dayjs(res.startTime), dayjs(res.endTime)],
  };
  editModalVisible.value = true;
};

const handleEdit = async () => {
  if (!selectedReservation.value || !editForm.value.carId || !editForm.value.range) return;
  
  try {
    await updateReservation(selectedReservation.value.id, {
      carId: editForm.value.carId,
      startTime: editForm.value.range[0].toISOString(),
      endTime: editForm.value.range[1].toISOString(),
    });
    message.success('Reservierung aktualisiert (muss neu bestätigt werden)');
    editModalVisible.value = false;
  } catch (e) {
    message.error('Fehler beim Aktualisieren der Reservierung');
  }
};

const handleComplete = async () => {
  if (!selectedReservation.value || endMileage.value === null) return;
  
  if (endMileage.value < selectedReservation.value.car.currentMileage) {
    message.warning('Kilometerstand kann nicht niedriger sein als vorher');
    return;
  }

  try {
    await completeReservation(selectedReservation.value.id, endMileage.value);
    message.success('Fahrt abgeschlossen');
    mileageModalVisible.value = false;
  } catch (e) {
    message.error('Fehler beim Abschließen der Fahrt');
  }
};

const myReservations = computed(() => 
  reservations.value.filter(r => r.user?.id === props.currentUserId)
);

const getListData = (value: Dayjs) => {
  return myReservations.value.filter(res => 
    dayjs(res.startTime).isSame(value, 'day')
  ).map(res => ({
    color: res.user?.color || '#1890ff',
    status: res.status,
    content: `${res.car?.brand || 'Auto'}: ${dayjs(res.startTime).format('HH:mm')}`,
  }));
};

const incomingReservations = computed(() => 
  reservations.value.filter(r => r.car?.owner?.id === props.currentUserId && r.status === ReservationStatus.PENDING)
);

const columns = [
  { title: 'Fahrzeug', dataIndex: ['car', 'brand'], key: 'car' },
  { title: 'Von', dataIndex: 'startTime', key: 'start' },
  { title: 'Bis', dataIndex: 'endTime', key: 'end' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Aktion', key: 'action' },
];

const formatDate = (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm');
</script>

<template>
  <div>
    <div class="view-header">
      <h2>Meine Reservierungen</h2>
      <a-radio-group v-model:value="viewMode" button-style="solid">
        <a-radio-button value="list">Liste</a-radio-button>
        <a-radio-button value="calendar">Kalender</a-radio-button>
      </a-radio-group>
    </div>
    
    <div v-if="viewMode === 'list'">
      <div v-if="isDesktop">
        <a-table :dataSource="myReservations" :columns="columns" :loading="loading" rowKey="id">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'car'">
              {{ record.car?.brand }} {{ record.car?.model }} ({{ record.car?.licensePlate }})
            </template>
            <template v-else-if="column.key === 'start'">
              {{ formatDate(record.startTime) }}
            </template>
            <template v-else-if="column.key === 'end'">
              {{ formatDate(record.endTime) }}
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.status === 'APPROVED' ? 'green' : record.status === 'PENDING' ? 'orange' : record.status === 'COMPLETED' ? 'blue' : 'red'">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button 
                  v-if="record.status === 'APPROVED' && dayjs().isAfter(dayjs(record.startTime))"
                  type="primary" 
                  size="small" 
                  @click="openMileageModal(record)"
                >
                  Fahrt beenden
                </a-button>
                <a-button
                  v-if="record.status === 'PENDING' || record.status === 'APPROVED'"
                  size="small"
                  @click="openEditModal(record)"
                >
                  <template #icon><EditOutlined /></template>
                  Bearbeiten
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else>
        <a-list :dataSource="myReservations" :loading="loading">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-card style="width: 100%" :title="item.car?.brand + ' ' + item.car?.model">
                <template #extra>
                  <a-tag :color="item.status === 'APPROVED' ? 'green' : item.status === 'PENDING' ? 'orange' : item.status === 'COMPLETED' ? 'blue' : 'red'">
                    {{ item.status }}
                  </a-tag>
                </template>
                <p><strong>Zeitraum:</strong> {{ formatDate(item.startTime) }} - {{ formatDate(item.endTime) }}</p>
                <a-space direction="vertical" style="width: 100%">
                  <a-button 
                    v-if="item.status === 'APPROVED' && dayjs().isAfter(dayjs(item.startTime))"
                    type="primary" 
                    block
                    @click="openMileageModal(item)"
                  >
                    Fahrt beenden
                  </a-button>
                  <a-button
                    v-if="item.status === 'PENDING' || item.status === 'APPROVED'"
                    block
                    @click="openEditModal(item)"
                  >
                    <template #icon><EditOutlined /></template>
                    Bearbeiten
                  </a-button>
                </a-space>
              </a-card>
            </a-list-item>
          </template>
        </a-list>
      </div>
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
                    <CloseCircleOutlined v-else-if="item.status === 'REJECTED'" style="color: red" />
                    {{ item.content }}
                  </span>
                </template>
              </a-badge>
            </li>
          </ul>
        </template>
      </a-calendar>
    </div>

    <h2 style="margin-top: 24px">Eingehende Anfragen (als Besitzer)</h2>
    <a-list :dataSource="incomingReservations" :loading="loading">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta
            :title="item.user.name + ' möchte dein Auto (' + item.car.brand + ') leihen'"
            :description="formatDate(item.startTime) + ' - ' + formatDate(item.endTime)"
          />
          <template #actions>
            <a-button type="primary" @click="handleStatus(item.id, ReservationStatus.APPROVED)">Bestätigen</a-button>
            <a-button danger @click="handleStatus(item.id, ReservationStatus.REJECTED)">Ablehnen</a-button>
          </template>
        </a-list-item>
      </template>
    </a-list>

    <a-modal v-model:open="mileageModalVisible" title="Kilometerstand eintragen" @ok="handleComplete">
      <p>Bitte trage den aktuellen Kilometerstand nach deiner Fahrt ein.</p>
      <a-input-number v-model:value="endMileage" style="width: 100%" :min="0" />
      <p style="margin-top: 8px; color: gray">Vorheriger Stand: {{ selectedReservation?.car.currentMileage }} km</p>
    </a-modal>

    <a-modal v-model:open="editModalVisible" title="Reservierung bearbeiten" @ok="handleEdit">
      <a-form layout="vertical">
        <a-form-item label="Fahrzeug">
          <a-select v-model:value="editForm.carId" placeholder="Auto wählen">
            <a-select-option v-for="car in cars" :key="car.id" :value="car.id">
              {{ car.brand }} {{ car.model }} ({{ car.licensePlate }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Zeitraum">
          <a-range-picker
            v-model:value="editForm.range"
            show-time
            format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
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
  margin-bottom: 24px;
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
