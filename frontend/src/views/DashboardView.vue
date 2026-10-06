<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getReservations, completeReservation, socket, getUsers } from '../api/index';
import { ReservationStatus } from '../types/index';
import type { Reservation, User } from '../types/index';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  CarOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  MessageOutlined
} from '@ant-design/icons-vue';

const props = defineProps<{ currentUserId: number | null }>();

const reservations = ref<Reservation[]>([]);
const users = ref<User[]>([]);
const loading = ref(false);
const mileageModalVisible = ref(false);
const selectedReservation = ref<Reservation | null>(null);
const endMileage = ref<number | null>(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const [resData, userData] = await Promise.all([getReservations(), getUsers()]);
    reservations.value = resData;
    users.value = userData;
  } catch (e) {
    message.error('Fehler beim Laden der Dashboard-Daten');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
  socket.on('reservationUpdate', fetchData);
  socket.on('carUpdate', fetchData);
});

onUnmounted(() => {
  socket.off('reservationUpdate', fetchData);
  socket.off('carUpdate', fetchData);
});

const currentUser = computed(() => users.value.find(u => u.id === props.currentUserId));

const myReservations = computed(() =>
  reservations.value.filter(r => r.user?.id === props.currentUserId)
);

const activeReservation = computed(() => {
  const now = dayjs();
  return myReservations.value.find(r =>
    r.status === ReservationStatus.APPROVED &&
    now.isAfter(dayjs(r.startTime)) &&
    now.isBefore(dayjs(r.endTime))
  );
});

const nextReservation = computed(() => {
  const now = dayjs();
  return myReservations.value
    .filter(r => r.status === ReservationStatus.APPROVED && dayjs(r.startTime).isAfter(now))
    .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)))[0];
});

const pendingRequests = computed(() => {
  if (!props.currentUserId) return [];
  return reservations.value.filter(r =>
    r.car?.owner?.id === props.currentUserId &&
    r.status === ReservationStatus.PENDING
  );
});

const openMileageModal = (res: Reservation) => {
  selectedReservation.value = res;
  endMileage.value = res.car.currentMileage;
  mileageModalVisible.value = true;
};

const handleComplete = async () => {
  if (!selectedReservation.value || endMileage.value === null) return;

  if (endMileage.value < selectedReservation.value.car.currentMileage) {
    message.warning('Kilometerstand kann nicht niedriger sein als vorher');
    return;
  }

  try {
    await completeReservation(selectedReservation.value.id, endMileage.value);
    message.success('Fahrt erfolgreich abgeschlossen');
    mileageModalVisible.value = false;
    fetchData();
  } catch (e) {
    message.error('Fehler beim Abschließen der Fahrt');
  }
};

const formatDate = (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm');
const getRelativeTime = (date: string) => dayjs(date).fromNow();

</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1>Hallo, {{ currentUser?.name || 'Nachbar' }}!</h1>
    </div>

    <a-row :gutter="[16, 16]">
      <!-- Aktive Fahrt -->
      <a-col :xs="24" :md="12" v-if="activeReservation">
        <a-card title="Aktuelle Fahrt" class="action-card active-card">
          <template #extra><a-tag color="green">LÄUFT GERADE</a-tag></template>
          <div class="card-content">
            <div class="car-info">
              <CarOutlined style="font-size: 24px; color: #52c41a" />
              <div class="details">
                <h3>{{ activeReservation.car.brand }} {{ activeReservation.car.model }}</h3>
                <p>{{ activeReservation.car.licensePlate }}</p>
              </div>
            </div>
            <div class="time-info">
              <ClockCircleOutlined /> Bis {{ formatDate(activeReservation.endTime) }}
            </div>
            <a-button type="primary" block size="large" @click="openMileageModal(activeReservation)" style="margin-top: 16px">
              Fahrt beenden & KM eintragen
            </a-button>
          </div>
        </a-card>
      </a-col>

      <!-- Nächste Fahrt -->
      <a-col :xs="24" :md="12" v-if="nextReservation && !activeReservation">
        <a-card title="Nächste Reservierung" class="action-card">
          <div class="card-content">
            <div class="car-info">
              <CarOutlined style="font-size: 24px; color: #1890ff" />
              <div class="details">
                <h3>{{ nextReservation.car.brand }} {{ nextReservation.car.model }}</h3>
                <p>{{ nextReservation.car.licensePlate }}</p>
              </div>
            </div>
            <div class="time-info">
              <ClockCircleOutlined /> {{ formatDate(nextReservation.startTime) }}
              <div class="relative-time">{{ getRelativeTime(nextReservation.startTime) }}</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- Keine Fahrten -->
      <a-col :xs="24" :md="12" v-if="!activeReservation && !nextReservation">
        <a-card title="Keine anstehenden Fahrten" class="action-card">
          <p>Du hast aktuell keine Reservierungen geplant.</p>
          <a-button type="dashed" block @click="$router.push('/cars')">
            Jetzt ein Fahrzeug reservieren
          </a-button>
        </a-card>
      </a-col>

      <!-- Offene Anfragen für Besitzer -->
      <a-col :xs="24" :md="12" v-if="pendingRequests.length > 0">
        <a-card title="Offene Anfragen" class="action-card warning-card">
          <template #extra><a-badge :count="pendingRequests.length" /></template>
          <p>Du hast {{ pendingRequests.length }} neue Reservierungsanfragen für deine Fahrzeuge.</p>
          <a-button type="primary" block @click="$router.push('/reservations')">
            Anfragen prüfen
          </a-button>
        </a-card>
      </a-col>

      <!-- Schnellzugriffe -->
      <a-col :xs="24" :md="24">
        <div class="quick-actions">
          <h3>Schnellzugriff</h3>
          <a-space wrap>
            <a-button @click="$router.push('/cars')">
              <template #icon><DashboardOutlined /></template> Fahrzeugübersicht
            </a-button>
            <a-button @click="$router.push('/reservations')">
              <template #icon><ClockCircleOutlined /></template> Meine Reservierungen
            </a-button>
            <a-button @click="$router.push('/neighbors')">
              <template #icon><MessageOutlined /></template> Nachbarn kontaktieren
            </a-button>
          </a-space>
        </div>
      </a-col>
    </a-row>

    <a-modal v-model:open="mileageModalVisible" title="Fahrt beenden" @ok="handleComplete">
      <div v-if="selectedReservation">
        <p>Wir hoffen, du hattest eine gute Fahrt mit dem <strong>{{ selectedReservation.car.brand }}</strong>!</p>
        <p>Bitte trage den neuen Kilometerstand ein:</p>
        <a-input-number v-model:value="endMileage" style="width: 100%" :min="0" />
        <p style="margin-top: 8px; color: gray">Letzter Stand: {{ selectedReservation.car.currentMileage }} km</p>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px 0;
}
.welcome-section {
  margin-bottom: 32px;
}

.welcome-section h1 {
  margin-bottom: 8px;
  color: #275b14;
}
.action-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.active-card {
  border: 2px solid #52c41a;
}
.warning-card {
  border: 1px solid #faad14;
}
.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.car-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.details h3 {
  margin: 0;
}
.details p {
  margin: 0;
  color: #8c8c8c;
}
.time-info {
  font-size: 16px;
  font-weight: 500;
}
.relative-time {
  font-size: 14px;
  color: #1890ff;
  margin-top: 4px;
}
.quick-actions {
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
}
.quick-actions h3 {
  margin-bottom: 16px;
}
</style>
