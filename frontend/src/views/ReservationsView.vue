<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { getReservations, updateReservationStatus, completeReservation, getCars, updateReservation, deleteReservation, socket } from '../api/index';
import { ReservationStatus } from '../types/index';
import type { Reservation, Car } from '../types/index';
import { message, Modal } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  CheckOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  CarOutlined,
  HistoryOutlined,
  InboxOutlined,
  InfoCircleOutlined
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
const viewMode = ref<'list' | 'calendar'>(localStorage.getItem('brumbrum_reservations_view_mode') as 'list' | 'calendar' || 'list');
const calendarDate = ref<Dayjs>(dayjs(localStorage.getItem('brumbrum_reservations_calendar_date') || undefined));
const storedIds = localStorage.getItem('brumbrum_selected_car_ids_res');
const selectedCarIds = ref<number[]>(storedIds ? JSON.parse(storedIds) : []);
const isFirstLoad = ref(!storedIds);
const activeTab = ref('upcoming');

watch(viewMode, (val) => {
  localStorage.setItem('brumbrum_reservations_view_mode', val);
});

watch(calendarDate, (val) => {
  localStorage.setItem('brumbrum_reservations_calendar_date', val.toISOString());
});

watch(selectedCarIds, (val) => {
  localStorage.setItem('brumbrum_selected_car_ids_res', JSON.stringify(val));
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

const activeCars = computed(() => cars.value.filter(c => c.isActive));

watch(activeCars, (newCars) => {
  if (isFirstLoad.value && newCars.length > 0) {
    selectedCarIds.value = newCars.map(c => c.id);
    isFirstLoad.value = false;
  }
}, { immediate: true });

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

const handleDelete = (id: number) => {
  Modal.confirm({
    title: 'Reservierung löschen?',
    content: 'Möchtest du diese Reservierung wirklich dauerhaft löschen?',
    okText: 'Löschen',
    okType: 'danger',
    cancelText: 'Abbrechen',
    async onOk() {
      try {
        await deleteReservation(id);
        message.success('Reservierung gelöscht');
      } catch (e) {
        message.error('Fehler beim Löschen der Reservierung');
      }
    },
  });
};

const allRelevantReservations = computed(() =>
  reservations.value.filter(r => 
    r.user?.id === props.currentUserId || 
    r.car?.owner?.id === props.currentUserId
  )
);

const pendingRequests = computed(() =>
  reservations.value.filter(r => 
    r.car?.owner?.id === props.currentUserId && 
    r.status === ReservationStatus.PENDING
  )
);

const upcomingReservations = computed(() => {
  const now = dayjs();
  return allRelevantReservations.value.filter(r => 
    dayjs(r.endTime).isAfter(now) && 
    !(r.car?.owner?.id === props.currentUserId && r.status === ReservationStatus.PENDING)
  ).sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
});

const pastReservations = computed(() => {
  const now = dayjs();
  return allRelevantReservations.value.filter(r => 
    dayjs(r.endTime).isBefore(now) || r.status === ReservationStatus.COMPLETED
  ).sort((a, b) => dayjs(b.startTime).diff(dayjs(a.startTime)));
});

const getListData = (value: Dayjs) => {
  const day = value.startOf('day');
  return allRelevantReservations.value.filter(res => {
    const start = dayjs(res.startTime).startOf('day');
    const end = dayjs(res.endTime).startOf('day');
    const isSelectedCar = res.car && selectedCarIds.value.includes(res.car.id);
    return isSelectedCar && !day.isBefore(start) && !day.isAfter(end) && res.status !== ReservationStatus.REJECTED;
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


const formatDate = (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm');

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'green';
    case 'PENDING': return 'orange';
    case 'COMPLETED': return 'blue';
    case 'REJECTED': return 'red';
    default: return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'Bestätigt';
    case 'PENDING': return 'Ausstehend';
    case 'COMPLETED': return 'Abgeschlossen';
    case 'REJECTED': return 'Abgelehnt';
    default: return status;
  }
};
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
      <a-tabs v-model:activeKey="activeTab" class="reservation-tabs">
        <a-tab-pane key="upcoming">
          <template #tab>
            <span><ClockCircleOutlined /> Geplante Fahrten</span>
          </template>
          <div class="tab-content">
            <a-list :dataSource="upcomingReservations" :loading="loading" :locale="{ emptyText: 'Keine geplanten Fahrten' }">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-card class="res-card" :hoverable="true">
                    <div class="res-card-header">
                      <div class="car-details">
                        <CarOutlined class="icon-main" />
                        <div>
                          <div class="car-name">{{ item.car?.brand }} {{ item.car?.model }}</div>
                          <a-tag color="blue" size="small">{{ item.car?.licensePlate }}</a-tag>
                          <a-tag v-if="item.car?.owner?.id === currentUserId" size="small" color="orange">Mein Auto</a-tag>
                        </div>
                      </div>
                      <a-tag :color="getStatusColor(item.status)" class="status-tag">
                        {{ getStatusLabel(item.status) }}
                      </a-tag>
                    </div>

                    <div class="res-card-body">
                      <div class="info-row">
                        <ClockCircleOutlined />
                        <span>{{ formatDate(item.startTime) }} — {{ formatDate(item.endTime) }}</span>
                      </div>
                      <div class="info-row">
                        <UserOutlined />
                        <span v-if="item.user?.id === currentUserId">Ich</span>
                        <span v-else>{{ item.user?.name }}</span>
                        <span v-if="item.car?.owner?.id !== currentUserId && item.user?.id === currentUserId" class="owner-info">
                          (Besitzer: {{ item.car?.owner?.name }})
                        </span>
                      </div>
                    </div>

                    <div class="res-card-actions">
                      <a-space wrap>
                        <!-- Aktionen für den Buchenden -->
                        <template v-if="item.user?.id === currentUserId">
                          <a-button
                            v-if="item.status === 'APPROVED' && dayjs().isAfter(dayjs(item.startTime))"
                            type="primary"
                            @click="openMileageModal(item)"
                          >
                            Fahrt beenden
                          </a-button>
                          <a-button
                            v-if="item.status === 'PENDING' || item.status === 'APPROVED'"
                            @click="openEditModal(item)"
                          >
                            <template #icon><EditOutlined /></template> Bearbeiten
                          </a-button>
                          <a-button
                            danger
                            @click="handleDelete(item.id)"
                          >
                            <template #icon><DeleteOutlined /></template> Stornieren
                          </a-button>
                        </template>

                        <!-- Aktionen für den Autobesitzer -->
                        <template v-if="item.car?.owner?.id === currentUserId && item.status === 'PENDING'">
                          <a-button type="primary" @click="handleStatus(item.id, ReservationStatus.APPROVED)">Bestätigen</a-button>
                          <a-button danger @click="handleStatus(item.id, ReservationStatus.REJECTED)">Ablehnen</a-button>
                        </template>
                      </a-space>
                    </div>
                  </a-card>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </a-tab-pane>

        <a-tab-pane key="pending" v-if="pendingRequests.length > 0">
          <template #tab>
            <a-badge :count="pendingRequests.length" :offset="[10, 0]">
              <span><InboxOutlined /> Anfragen</span>
            </a-badge>
          </template>
          <div class="tab-content">
            <a-alert
              message="Nachbarn möchten deine Autos leihen"
              type="info"
              show-icon
              style="margin-bottom: 16px"
            >
              <template #icon><InfoCircleOutlined /></template>
            </a-alert>
            <a-list :dataSource="pendingRequests" :loading="loading">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-card class="res-card pending-card">
                    <div class="res-card-header">
                      <div class="car-details">
                        <CarOutlined class="icon-main" />
                        <div>
                          <div class="car-name">{{ item.car?.brand }} {{ item.car?.model }}</div>
                          <a-tag color="blue" size="small">{{ item.car?.licensePlate }}</a-tag>
                        </div>
                      </div>
                      <a-tag color="orange">ANFRAGE</a-tag>
                    </div>
                    <div class="res-card-body">
                      <div class="info-row">
                        <UserOutlined />
                        <span><strong>{{ item.user?.name }}</strong> möchte dein Auto leihen</span>
                      </div>
                      <div class="info-row">
                        <ClockCircleOutlined />
                        <span>{{ formatDate(item.startTime) }} — {{ formatDate(item.endTime) }}</span>
                      </div>
                    </div>
                    <div class="res-card-actions">
                      <a-button type="primary" @click="handleStatus(item.id, ReservationStatus.APPROVED)">Bestätigen</a-button>
                      <a-button danger style="margin-left: 8px" @click="handleStatus(item.id, ReservationStatus.REJECTED)">Ablehnen</a-button>
                    </div>
                  </a-card>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </a-tab-pane>

        <a-tab-pane key="history">
          <template #tab>
            <span><HistoryOutlined /> Verlauf</span>
          </template>
          <div class="tab-content">
            <a-list :dataSource="pastReservations" :loading="loading" :locale="{ emptyText: 'Kein Verlauf vorhanden' }">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-card class="res-card past-card">
                    <div class="res-card-header">
                      <div class="car-details">
                        <CarOutlined class="icon-main" style="color: #8c8c8c" />
                        <div>
                          <div class="car-name" style="color: #8c8c8c">{{ item.car?.brand }} {{ item.car?.model }}</div>
                          <a-tag size="small">{{ item.car?.licensePlate }}</a-tag>
                        </div>
                      </div>
                      <a-tag :color="getStatusColor(item.status)">
                        {{ getStatusLabel(item.status) }}
                      </a-tag>
                    </div>
                    <div class="res-card-body">
                      <div class="info-row" style="color: #8c8c8c">
                        <ClockCircleOutlined />
                        <span>{{ formatDate(item.startTime) }} — {{ formatDate(item.endTime) }}</span>
                      </div>
                      <div class="info-row" style="color: #8c8c8c">
                        <UserOutlined />
                        <span>{{ item.user?.id === currentUserId ? 'Ich' : item.user?.name }}</span>
                      </div>
                    </div>
                  </a-card>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </a-tab-pane>
      </a-tabs>
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
                <CloseCircleOutlined v-else-if="item.status === 'REJECTED'" />
                {{ item.content }}
              </span>
            </div>
          </div>
        </template>
      </a-calendar>
    </div>


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
  margin-bottom: 24px;
}

.reservation-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

.tab-content {
  padding: 4px;
}

.res-card {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.res-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.res-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.car-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-main {
  font-size: 28px;
  color: #1890ff;
}

.car-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.res-card-body {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.owner-info {
  font-size: 13px;
  color: #8c8c8c;
  margin-left: 4px;
}

.res-card-actions {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.pending-card {
  border-left: 4px solid #faad14;
}

.past-card {
  background-color: #fafafa;
  opacity: 0.8;
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
