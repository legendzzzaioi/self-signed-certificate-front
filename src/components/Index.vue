<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface FormData {
  selection: string;
  domain: string;
  ip: string;
  caSubject: string;
  caValidityDays: number;
  rootSubject: string;
  rootValidityDays: number;
  serialNumber: number;
  rootOnlySubject: string;
  rootOnlyValidityDays: number;
  rootOnlySerialNumber: number;
}

const formData = ref<FormData>({
  selection: 'all',
  domain: '',
  ip: '',
  caSubject: '/C=CN/ST=Jiangsu/L=Wuxi/O=zzz/OU=zzz/CN=zzz',
  caValidityDays: 73000,
  rootSubject: '/C=CN/ST=Jiangsu/L=Wuxi/O=zzz/OU=zzz/CN=zzz Root CA',
  rootValidityDays: 73000,
  serialNumber: 1000,
  rootOnlySubject: '/C=CN/ST=Jiangsu/L=Wuxi/O=zzz/OU=zzz/CN=zzz Root CA',
  rootOnlyValidityDays: 73000,
  rootOnlySerialNumber: 1000,
});

const showModal = ref(false);
const modalMessage = ref('');
const showError = ref(false);
const errorMessage = ref('');

const setInitialSelection = () => {
  formData.value.selection = 'all'; 
};

onMounted(setInitialSelection);

async function handleSubmit(): Promise<void> {
  if (!validateFormData()) {
    showError.value = true;
    return;
  }

  showError.value = false;

  const formDataObj = new FormData();
  Object.keys(formData.value).forEach(key => {
    formDataObj.append(key, (formData.value as any)[key]);
  });

  try {
    const response = await fetch('/api/v1/command', {
      method: 'POST',
      body: formDataObj,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.message === 'success') {
        router.push('/files');
      } else {
        showModalMessage('Generation failed: ' + (data.error || 'Unknown error'));
      }
    } else {
      showModalMessage(`Request failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error:', error);
    showModalMessage(`An error occurred: ${error || 'Unknown error'}`);
  }
}

function validateFormData(): boolean {
  const { selection, domain, ip } = formData.value;
  if (selection === 'all' && !domain && !ip) {
    errorMessage.value = 'Please fill in at least one of Domain(s) or IP(s).';
    return false;
  }
  return true;
}

function showModalMessage(message: string): void {
  modalMessage.value = message;
  showModal.value = true;
}

function closeModal(): void {
  showModal.value = false;
}
</script>

<template>
  <div>
    <h1>Generate Certificates</h1>
    <form @submit.prevent="handleSubmit">
      <label for="selection">Select:</label>
      <select id="selection" name="selection" v-model="formData.selection">
        <option value="all">Generate all certificates</option>
        <option value="rootOnly">Generate root certificate only</option>
      </select><br>

      <div v-if="formData.selection === 'all'">
        <label for="domain">Domain(s):</label>
        <input type="text" id="domain" name="domain" v-model="formData.domain" placeholder="Optional parameter, multiple parameters separated by commas, example: test.com,*.zzz.com"><br>

        <label for="ip">IP(s):</label>
        <input type="text" id="ip" name="ip" v-model="formData.ip" placeholder="Optional parameter, multiple parameters separated by commas"><br>

        <label for="caSubject">CA Subject:</label>
        <input type="text" id="caSubject" name="caSubject" v-model="formData.caSubject" placeholder="Default: /C=CN/ST=Jiangsu/L=Wuxi/O=zzz/OU=zzz/CN=zzz"><br>

        <label for="caValidityDays">CA Validity Days:</label>
        <input type="number" id="caValidityDays" name="caValidityDays" v-model="formData.caValidityDays" placeholder="Default: 73000"><br>

        <label for="rootSubject">Root CA Subject:</label>
        <input type="text" id="rootSubject" name="rootSubject" v-model="formData.rootSubject" placeholder="Default: /C=CN/ST=Jiangsu/L=Wuxi/O=zzz/OU=zzz/CN=zzz Root CA"><br>

        <label for="rootValidityDays">Root CA Validity Days:</label>
        <input type="number" id="rootValidityDays" name="rootValidityDays" v-model="formData.rootValidityDays" placeholder="If not specified, same as CA Validity Days"><br>

        <label for="serialNumber">Serial Number:</label>
        <input type="number" id="serialNumber" name="serialNumber" v-model="formData.serialNumber" placeholder="Default: 1000"><br>
      </div>
      <div v-if="formData.selection === 'rootOnly'">
        <label for="rootOnlySubject">Root CA Subject:</label>
        <input type="text" id="rootOnlySubject" name="rootOnlySubject" v-model="formData.rootOnlySubject" placeholder="Default: /C=CN/ST=Jiangsu/L=Wuxi/O=zzz/OU=zzz/CN=zzz Root CA"><br>
        <label for="rootOnlyValidityDays">Root CA Validity Days:</label>
        <input type="number" id="rootOnlyValidityDays" name="rootOnlyValidityDays" v-model="formData.rootOnlyValidityDays" placeholder="Default: 73000"><br>
        <label for="rootOnlySerialNumber">Serial Number:</label>
        <input type="number" id="rootOnlySerialNumber" name="rootOnlySerialNumber" v-model="formData.rootOnlySerialNumber" placeholder="Default: 1000"><br>
      </div>

      <input type="submit" value="Submit">
      <button type="button" class="action-button" @click="() => router.push('/files')">View Files</button>
      <button type="button" class="action-button" @click="() => router.push('/result')">View Logs</button>
    </form>

    <p v-if="showError" class="error-message">{{ errorMessage }}</p>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <p>{{ modalMessage }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
form {
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

label {
  display: block;
  margin-bottom: 10px;
}

input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

input[type="submit"],
button.action-button {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 16px;
}

button.action-button {
  margin-left: 10px;
  background-color: #6c757d;
}

.error-message {
  color: red;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
}

.modal-content {
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  position: relative;
  width: 400px;
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
</style>
