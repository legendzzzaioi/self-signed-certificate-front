<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue';
import ClipboardJS from 'clipboard';

interface FileItem {
  name: string;
  date: string;
  context: string;
}

const fileContent = ref('');
const copyStatus = ref('');
const showDates = ref(true);
const fileList = ref<FileItem[]>([]);
const showModal = ref(false);
const modalMessage = ref('');

async function fetchFileList(): Promise<void> {
  try {
    const response = await fetch('/api/v1/filelist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({type: 'cert'}),
    });

    if (response.ok) {
      fileList.value = await response.json() as FileItem[];
    } else {
      showModalMessage(`Failed to get file list: ${response.statusText}`);
    }
  } catch (error) {
    showModalMessage(`Error: ${error}`);
  }
}

async function viewFile(name: string, action: 'view' | 'download'): Promise<void> {
  try {
    const response = await fetch('/api/v1/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({type: 'cert', name, method: 'view'}),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.message === 'success') {
        if (action === 'view') {
          fileContent.value = data.context;
          openModal();
        } else if (action === 'download') {
          downloadFileContent(name, data.context);
        }
      } else {
        showModalMessage('Unable to view file: ' + (data.error || 'Unknown error'));
      }
    } else {
      showModalMessage('Unable to view file');
    }
  } catch (error) {
    showModalMessage(`Error: ${error}`);
  }
}

function openModal(): void {
  showModal.value = true;
  resetCopyStatus();
  nextTick(() => {
    setupClipboard();
  });
}

function setupClipboard(): void {
  const copyButton = document.getElementById('copyButton');
  if (copyButton) {
    const clipboard = new ClipboardJS(copyButton, {
      text: () => fileContent.value,
    });

    clipboard.on('success', () => updateCopyStatus('Success'));
    clipboard.on('error', () => updateCopyStatus('Failed'));
  }
}

function closeModal(): void {
  showModal.value = false;
  resetCopyStatus();
}

function resetCopyStatus(): void {
  copyStatus.value = '';
}

function downloadFileContent(fileName: string, content: string): void {
  const blob = new Blob([content], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function deleteFile(name: string): Promise<void> {
  try {
    const response = await fetch('/api/v1/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({type: 'cert', name, method: 'delete'}),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.message === 'success') {
        await fetchFileList();
      } else {
        showModalMessage('Deletion failed: ' + (data.error || 'Unknown error'));
      }
    } else {
      showModalMessage(`Request failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    showModalMessage(`Error: ${error}`);
  }
}

function showModalMessage(message: string): void {
  modalMessage.value = message;
  showModal.value = true;
}

onMounted(fetchFileList);

function updateCopyStatus(message: string): void {
  copyStatus.value = message;
  setTimeout(resetCopyStatus, 1000);
}
</script>

<template>
  <div>
    <h1>Generated File List</h1>
    <ul v-if="fileList.length > 0">
      <li v-for="file in fileList" :key="file.name">
        <span class="file-name">{{ file.name }}</span>
        <span class="date-info" v-if="showDates">Change on: {{ file.date }}</span>
        <div class="button-container">
          <button class="view-button" @click="viewFile(file.name, 'view')">View</button>
          <button class="download-button" @click="viewFile(file.name, 'download')">Download</button>
          <button class="delete-button" @click="deleteFile(file.name)">Delete</button>
        </div>
      </li>
      <button @click="showDates = !showDates" class="toggle-date-button">
        {{ showDates ? 'Hide Dates' : 'Show Dates' }}
      </button>
    </ul>
    <p v-else class="no-files">No files have been generated yet.</p>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <div id="file-content">{{ fileContent }}</div>
        <div class="copy-container">
          <button id="copyButton">Copy</button>
          <div>{{ copyStatus }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
ul {
  max-width: 1000px;
  margin: 0 auto;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

li {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button {
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 5px;
  width: 100px;
}

button.view-button {
  background-color: #337ab7;
}

button.download-button {
  background-color: #5cb85c;
}

button.delete-button {
  background-color: #d9534f;
}

.toggle-date-button {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 16px;
  width: 130px;
  margin-top: 20px;
}

.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: auto;
}

.modal-content {
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  position: relative;
  width: 800px;
  max-width: 90%;
  text-align: center;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 24px;
}

#file-content {
  padding: 10px;
  white-space: pre-wrap;
  font-family: monospace;
  max-height: 400px;
  overflow-y: auto;
}

.copy-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

#copyButton {
  padding: 10px;
  background-color: #6c757d;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.date-info {
  font-style: italic;
}

.file-name {
  width: 100px;
  display: inline-block;
}

.no-files {
  text-align: center;
  font-weight: bold;
  padding: 20px;
}
</style>
