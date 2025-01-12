const apiUrl = 'http://localhost:3000';
let token = '';
let userId = '';
let userRole = '';
let selectedPatientId = ''; // ID do paciente atualmente selecionado

let doctorIdChat = '';
let patientIdChat = '';

// Função de login
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      if (response.ok) {
        const data = await response.json();
        token = data.token;
        userId = data.userId;
        userRole = data.role; // Recebe o papel do usuário (médico ou paciente) do backend
  
        document.getElementById('login-section').style.display = 'none';
  
        // Exibe seções com base no papel do usuário
        if (userRole === 'doctor') {
          doctorIdChat = userId;
          loadPatients(); // Carrega a lista de pacientes para o médico
          document.getElementById('patients-section').style.display = 'block';
          document.getElementById('btn-medicos').style.display = 'none';
        } else if (userRole === 'patient') {
            patientIdChat = userId;
          loadDoctors(); // Carrega a lista de médicos para o paciente
          document.getElementById('doctors-section').style.display = 'block';
          document.getElementById('btn-pacientes').style.display = 'none';
        }
        document.getElementById('nav-botoes').style.display = 'flex';
        // Após verificar o login com sucesso
        setupNavigation();

      } else {
        document.getElementById('login-error').textContent = 'Login inválido';
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Inicializa o seletor de papel do usuário
    const elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
  });
  
  async function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
  
    const errorElement = document.getElementById('register-error');
    const successElement = document.getElementById('register-success');
    errorElement.textContent = '';
    successElement.textContent = '';
  
    if (!name || !email || !password || !role) {
      errorElement.textContent = 'Todos os campos são obrigatórios.';
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        errorElement.textContent = errorText;
        return;
      }
  
      successElement.textContent = 'Registro realizado com sucesso! Você pode fazer login agora.';
    } catch (error) {
      errorElement.textContent = 'Erro ao registrar. Tente novamente mais tarde.';
      console.error('Erro no registro:', error);
    }
  }
  
  

// Carrega a lista de pacientes do médico
async function loadPatients() {
  try {
    const response = await fetch(`${apiUrl}/patients`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status} - ${response.statusText}`);
    }

    const patients = await response.json();
    const patientsList = document.getElementById('patients-list');
    patientsList.innerHTML = '';

    patients.forEach(patient => {
      const listItem = document.createElement('li');
      listItem.textContent = patient.name;
      listItem.onclick = () => selectPatient(patient.id);
      patientsList.appendChild(listItem);
    });

    document.getElementById('patients-section').style.display = 'block';
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error);
    alert('Erro ao carregar a lista de pacientes.');
  }
}

// Carrega a lista de médicos para o paciente
async function loadDoctors() {
  try {
    const response = await fetch(`${apiUrl}/documents/doctors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status} - ${response.statusText}`);
    }

    const doctors = await response.json();
    const doctorsList = document.getElementById('doctors-list');
    doctorsList.innerHTML = '';

    doctors.forEach(doctor => {
      const listItem = document.createElement('li');
      listItem.textContent = doctor.name;
      listItem.onclick = () => selectDoctor(doctor.id);
      doctorsList.appendChild(listItem);
    });

    document.getElementById('doctors-section').style.display = 'block';
  } catch (error) {
    console.error('Erro ao carregar médicos:', error);
    alert('Erro ao carregar a lista de médicos.');
  }
}

// Seleciona um paciente ou médico para visualizar documentos e chat
function selectPatient(patientId) {
  selectedPatientId = patientId;
  patientIdChat = patientId;
  //document.getElementById('chat-section').style.display = 'block';
  document.getElementById('chat-btn').style.display = 'flex';
  document.getElementById('btn-docs').style.display = 'flex';
  fetchDocuments();
  initializeChat(doctorIdChat, patientIdChat);
}

function selectDoctor(doctorId) {
  selectedPatientId = userId; // Para o paciente, usa o próprio ID como referência
  doctorIdChat = doctorId;
  //document.getElementById('chat-section').style.display = 'block';
  document.getElementById('chat-btn').style.display = 'flex';
  document.getElementById('btn-docs').style.display = 'flex';
  
  fetchDocuments();
  initializeChat(doctorIdChat, patientIdChat);
}

// Função para buscar documentos do paciente selecionado
async function fetchDocuments() {
  try {
    const response = await fetch(`${apiUrl}/documents/${selectedPatientId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro: ${errorData.error}`);
    }

    const documents = await response.json();
    const documentList = document.getElementById('document-list');
    
    // Não remover o botão de upload
    const uploadButton = document.querySelector('#document-list .upload-button');
    if (uploadButton) {
      documentList.innerHTML = ''; // Limpa apenas os itens de documentos, mantendo o botão
      documentList.appendChild(uploadButton); // Adiciona o botão de volta
    }

    // Adiciona os documentos à lista
    documents.forEach(doc => {
      const listItem = document.createElement('li');
      listItem.textContent = doc.file_name;
      documentList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error.message);
    alert(error.message);
  }
}

function uploadDeArquivo() {
  document.getElementById('document-section').style.display = 'block';
}

  

// Função para fazer upload de documento para o paciente selecionado
async function uploadDocument() {
  const fileInput = document.getElementById('file-upload');
  const file = fileInput.files[0];

  if (!file || !selectedPatientId) {
    return alert('Selecione um arquivo e um paciente');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('doctor_id', userId);
  formData.append('patient_id', selectedPatientId);

  try {
    const response = await fetch(`${apiUrl}/documents/upload`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro desconhecido');
    }

    fetchDocuments();
  } catch (error) {
    console.error('Erro ao enviar documento:', error.message);
    alert(error.message);
  }
}

// Inicializa o WebSocket para chat com o paciente selecionado
let socket;

function initializeChat(doctorId, patientId) {
  // Conecta ao servidor
  socket = io(apiUrl);

  // Entra na sala específica do médico e paciente
  socket.on('connect', () => {
    socket.emit('joinRoom', { doctorId, patientId });
    console.log(`Conectado à sala room-${doctorId}-${patientId}`);
  });

  // Recebe e exibe as mensagens
  socket.on('receiveMessage', (data) => {
    displayMessage('Outro', data.message);
  });
}

// Função para enviar uma mensagem
function sendMessage() {
  const messageInput = document.getElementById('chat-message');
  const message = messageInput.value;

  if (message && socket) {
    // Use valores consistentes de doctorId e patientId para garantir a sala correta
    socket.emit('sendMessage', { doctorId: doctorIdChat , patientId: patientIdChat, message });
    displayMessage('Você', message); // Exibe a mensagem no próprio cliente
    messageInput.value = '';
  }
}

// Função para exibir mensagens no chat
function displayMessage(sender, message) {
  const chatWindow = document.getElementById('chat-window');
  const messageElement = document.createElement('p');
  messageElement.textContent = `${sender}: ${message}`;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Alterna a exibição do chat
function toggleChat() {
    const chatSection = document.getElementById('chat-section');
    chatSection.style.display = chatSection.style.display === 'block' ? 'none' : 'block';
  }
  
  // Exibe a seção apropriada com base na navegação
  function showSection(sectionId) {
    const sections = ['doctors-section', 'patients-section', 'document-section'];
    sections.forEach(id => {
      document.getElementById(id).style.display = id === sectionId ? 'block' : 'none';
    });
  }
  
  // Chama essa função após o login para mostrar a barra de navegação e o botão de chat
  function setupNavigation() {
    document.getElementById('nav-section').style.display = 'flex';
    document.getElementById('chat-btn').style.display = 'none';
    document.getElementById('nav-botoes').style.display = 'none';
    
  }

  document.getElementById('chat-btn').style.display = 'none';
  document.getElementById('nav-botoes').style.display = 'none';
  document.getElementById('btn-docs').style.display = 'none';
  document.getElementById('login-section').style.display = 'flex';
  document.getElementById('register-section').style.display = 'none';

  function showLogin() {
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('register-section').style.display = 'none';
  }
  
  function showRegister() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'flex';
  }
  
  




