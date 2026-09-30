<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getCars, createCar } from '../api/index';
import type { Car } from '../types/index';
import { message } from 'ant-design-vue';

const props = defineProps<{ currentUserId: number | null }>();

const cars = ref<Car[]>([]);
const loading = ref(false);
const isModalVisible = ref(false);
const isDesktop = ref(window.innerWidth > 768);

const updateWidth = () => {
  isDesktop.value = window.innerWidth > 768;
};

const newCar = ref({
  brand: '',
  model: '',
  licensePlate: '',
  currentMileage: 0,
});

const fetchCars = async () => {
  loading.value = true;
  try {
    cars.value = await getCars();
  } catch (e) {
    message.error('Fehler beim Laden der Fahrzeuge');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCars();
  window.addEventListener('resize', updateWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});

const myCars = computed(() => 
  cars.value.filter(c => c.owner?.id === props.currentUserId)
);

const handleOk = async () => {
  if (!props.currentUserId) return;
  
  try {
    await createCar({
      ...newCar.value,
      ownerId: props.currentUserId,
    });
    message.success('Fahrzeug hinzugefügt');
    isModalVisible.value = false;
    newCar.value = { brand: '', model: '', licensePlate: '', currentMileage: 0 };
    fetchCars();
  } catch (e) {
    message.error('Fehler beim Hinzufügen des Fahrzeugs');
  }
};

const columns = [
  { title: 'Marke', dataIndex: 'brand', key: 'brand' },
  { title: 'Modell', dataIndex: 'model', key: 'model' },
  { title: 'Kennzeichen', dataIndex: 'licensePlate', key: 'licensePlate' },
  { title: 'KM-Stand', dataIndex: 'currentMileage', key: 'mileage' },
];
</script>

<template>
  <div>
    <div class="view-header">
      <h2>Meine Fahrzeuge</h2>
      <a-button type="primary" @click="isModalVisible = true">Fahrzeug hinzufügen</a-button>
    </div>

    <div v-if="isDesktop">
      <a-table :dataSource="myCars" :columns="columns" :loading="loading" rowKey="id" />
    </div>
    
    <div v-else>
      <a-list :dataSource="myCars" :loading="loading">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-card style="width: 100%" :title="item.brand + ' ' + item.model">
              <template #extra><a-tag color="blue">{{ item.licensePlate }}</a-tag></template>
              <p><strong>Kilometerstand:</strong> {{ item.currentMileage }} km</p>
            </a-card>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <a-modal v-model:open="isModalVisible" title="Neues Fahrzeug hinzufügen" @ok="handleOk">
      <a-form layout="vertical">
        <a-form-item label="Marke">
          <a-input v-model:value="newCar.brand" placeholder="z.B. VW" />
        </a-form-item>
        <a-form-item label="Modell">
          <a-input v-model:value="newCar.model" placeholder="z.B. Golf" />
        </a-form-item>
        <a-form-item label="Kennzeichen">
          <a-input v-model:value="newCar.licensePlate" placeholder="z.B. B-XX 123" />
        </a-form-item>
        <a-form-item label="Aktueller Kilometerstand">
          <a-input-number v-model:value="newCar.currentMileage" style="width: 100%" :min="0" />
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
