import axios from 'axios';

export const httpTransport = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
});
