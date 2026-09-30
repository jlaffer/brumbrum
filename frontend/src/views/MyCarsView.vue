<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getCars, createCar, updateCar, getUsers, socket } from '../api/index';
import type { Car, User } from '../types/index';
import { message } from 'ant-design-vue';
import { EditOutlined } from '@ant-design/icons-vue';

const props = defineProps<{ currentUserId: number | null }>();

const cars = ref<Car[]>([]);
const users = ref<User[]>([]);
const loading = ref(false);
const isModalVisible = ref(false);
const editingCarId = ref<number | null>(null);
const isDesktop = ref(window.innerWidth > 768);

const updateWidth = () => {
  isDesktop.value = window.innerWidth > 768;
};

const carForm = ref({
  brand: '',
  model: '',
  licensePlate: '',
  currentMileage: 0,
  isActive: true,
  ownerId: null as number | null,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [carsData, usersData] = await Promise.all([getCars(), getUsers()]);
    cars.value = carsData;
    users.value = usersData;
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
  socket.on('userUpdate', fetchData);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
  socket.off('carUpdate', fetchData);
  socket.off('userUpdate', fetchData);
});

const myCars = computed(() =>
  cars.value.filter(c => c.owner?.id === props.currentUserId)
);

const showAddModal = () => {
  editingCarId.value = null;
  carForm.value = {
    brand: '',
    model: '',
    licensePlate: '',
    currentMileage: 0,
    isActive: true,
    ownerId: props.currentUserId
  };
  isModalVisible.value = true;
};

const showEditModal = (car: Car) => {
  editingCarId.value = car.id;
  carForm.value = {
    brand: car.brand,
    model: car.model,
    licensePlate: car.licensePlate,
    currentMileage: car.currentMileage,
    isActive: car.isActive,
    ownerId: car.owner?.id || null,
  };
  isModalVisible.value = true;
};

const handleOk = async () => {
  if (!props.currentUserId) return;

  try {
    if (editingCarId.value) {
      await updateCar(editingCarId.value, carForm.value);
      message.success('Fahrzeug aktualisiert');
    } else {
      await createCar(carForm.value);
      message.success('Fahrzeug hinzugefügt');
    }
    isModalVisible.value = false;
    fetchData();
  } catch (e) {
    message.error('Fehler beim Speichern des Fahrzeugs');
  }
};

const columns = [
  { title: 'Marke', dataIndex: 'brand', key: 'brand' },
  { title: 'Modell', dataIndex: 'model', key: 'model' },
  { title: 'Kennzeichen', dataIndex: 'licensePlate', key: 'licensePlate' },
  { title: 'KM-Stand', dataIndex: 'currentMileage', key: 'mileage' },
  { title: 'Status', key: 'status' },
  { title: 'Aktion', key: 'action' },
];
</script>

<template>
  <div>
    <div class="view-header">
      <h2>Meine Fahrzeuge</h2>
      <a-button type="primary" @click="showAddModal">Fahrzeug hinzufügen</a-button>
    </div>

    <div v-if="isDesktop">
      <a-table :dataSource="myCars" :columns="columns" :loading="loading" rowKey="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.isActive ? 'green' : 'red'">
              {{ record.isActive ? 'Aktiv' : 'Inaktiv' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="showEditModal(record)">
              <template #icon><EditOutlined /></template>
              Bearbeiten
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <div v-else>
      <a-list :dataSource="myCars" :loading="loading">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-card style="width: 100%" :title="item.brand + ' ' + item.model">
              <template #extra>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <a-tag :color="item.isActive ? 'green' : 'red'">{{ item.isActive ? 'Aktiv' : 'Inaktiv' }}</a-tag>
                  <a-tag color="blue">{{ item.licensePlate }}</a-tag>
                  <a-button size="small" type="text" @click="showEditModal(item)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </div>
              </template>
              <p><strong>Kilometerstand:</strong> {{ item.currentMileage }} km</p>
            </a-card>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <a-modal v-model:open="isModalVisible" :title="editingCarId ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug hinzufügen'" @ok="handleOk">
      <a-form layout="vertical">
        <a-form-item label="Besitzer">
          <a-select v-model:value="carForm.ownerId" placeholder="Besitzer auswählen">
            <a-select-option v-for="user in users" :key="user.id" :value="user.id">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div :style="{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: user.color }"></div>
                {{ user.name }}
              </div>
            </a-select-option>
          </a-select>

          <a-form-item label="Marke">
          <a-input v-model:value="carForm.brand" placeholder="z.B. VW" />
        </a-form-item>
        <a-form-item label="Modell">
          <a-input v-model:value="carForm.model" placeholder="z.B. Golf" />
        </a-form-item>
        <a-form-item label="Kennzeichen">
          <a-input v-model:value="carForm.licensePlate" placeholder="z.B. B-XX 123" />
        </a-form-item>
        <a-form-item label="Aktueller Kilometerstand">
          <a-input-number v-model:value="carForm.currentMileage" style="width: 100%" :min="0" />
        </a-form-item>
        <a-form-item label="Aktiv">
          <a-switch v-model:checked="carForm.isActive" />
          <span style="margin-left: 8px">{{ carForm.isActive ? 'Dieses Fahrzeug wird anderen angezeigt' : 'Dieses Fahrzeug ist aktuell nicht verfügbar' }}</span>
        </a-form-item>
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

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .view-header .ant-btn {
    width: 100%;
  }
}
</style>
