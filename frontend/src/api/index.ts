import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
});

export const socket = io(API_URL);

export const getCars = () => api.get('/cars').then(res => res.data);
export const createCar = (data: any) => api.post('/cars', data).then(res => res.data);
export const updateCar = (id: number, data: any) => api.patch(`/cars/${id}`, data).then(res => res.data);
export const getReservations = () => api.get('/reservations').then(res => res.data);
export const createReservation = (data: any) => api.post('/reservations', data).then(res => res.data);
export const updateReservation = (id: number, data: any) => api.patch(`/reservations/${id}`, data).then(res => res.data);
export const updateReservationStatus = (id: number, status: string) => api.patch(`/reservations/${id}/status`, { status }).then(res => res.data);
export const deleteReservation = (id: number) => api.delete(`/reservations/${id}`).then(res => res.data);
export const completeReservation = (id: number, endMileage: number) => api.patch(`/reservations/${id}/complete`, { endMileage }).then(res => res.data);
export const getUsers = () => api.get('/users').then(res => res.data);
export const createUser = (data: any) => api.post('/users', data).then(res => res.data);
export const updateUser = (id: number, data: any) => api.patch(`/users/${id}`, data).then(res => res.data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`).then(res => res.data);
