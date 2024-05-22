<script setup lang="ts">
import {ref, onMounted} from 'vue';

interface LogResponse {
  context: string;
}

const log = ref<LogResponse | null>(null);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');

async function fetchLog(): Promise<void> {
  try {
    const response = await fetch('/api/v1/log', {
      method: 'GET',
    });

    if (response.ok) {
      log.value = await response.json();
    } else {
      console.error('Failed to get log:', response.statusText);
      hasError.value = true;
      errorMessage.value = `Failed to get log: ${response.statusText}`;
    }
  } catch (error) {
    console.error('Error:', error);
    hasError.value = true;
    errorMessage.value = `Error: ${error}`;
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchLog);
</script>

<template>
  <div class="container">
    <h1>Logs</h1>
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
    <div v-else-if="log && log.context.trim() !== ''" class="log-content">
      <pre>{{ log.context }}</pre>
    </div>
    <div v-else-if="hasError" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>
    <div v-else class="no-logs">
      <p>No logs are available.</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.log-content pre {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
  max-width: 1200px;
  margin: auto;
}

.error-message {
  text-align: center;
  color: red;
  font-weight: bold;
  padding: 20px;
}

.no-logs {
  text-align: center;
  font-weight: bold;
  padding: 20px;
}
</style>
