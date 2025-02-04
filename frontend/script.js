const apiUrl = 'http://localhost:3000';
let token = '';
let userId = '';
let userRole = '';
let selectedPatientId = ''; // ID do paciente atualmente selecionado
let selectedSalaId = '';


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
        document.getElementById('dashboard').style.display = 'flex';
  
        // Exibe seções com base no papel do usuário
        if (userRole === 'doctor') {
          loadSalasByDoctor();
          document.getElementById('create-sala-button').style.display = 'flex';
          fetchPacientes();
        } else if (userRole === 'patient') {
          loadSalasByPatient();
          document.getElementById('create-sala-button').style.display = 'none';
          //document.getElementById('delete-doc-btn').style.display = 'none';
          //document.getElementById('document-list').innerHTML = '';
        }
        document.getElementById('nav-botoes').style.display = 'none';
        // Após verificar o login com sucesso
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
/*async function loadSalasByDoctor() {
  try {
    const response = await fetch(`${apiUrl}/patients/salas`, {
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
}*/

async function loadSalasByDoctor() {
  try {
    const response = await fetch(`${apiUrl}/salas`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status} - ${response.statusText}`);
    }

    const salas = await response.json();
    const salasList = document.getElementById('salasList');
    salasList.innerHTML = '';

    salas.forEach(sala => {
      const listItem = document.createElement('li');
      listItem.textContent = sala.sala_name;
      const salaDescription = sala.sala_name + " (" + sala.patient_name + ")";
      listItem.onclick = () => loadDocumentsFromSala(sala.id, sala.patient_id, salaDescription);
      salasList.appendChild(listItem);
    });

    document.getElementById('sala-list-section').style.display = 'block';
  } catch (error) {
    console.error('Erro ao carregar salas:', error);
    alert('Erro ao carregar a lista de salas.');
  }
}

// Carrega a lista de salas para o paciente
async function loadSalasByPatient() {
  try {
    const response = await fetch(`${apiUrl}/salas/salasByPatient`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status} - ${response.statusText}`);
    }

    const salas = await response.json();
    const salasList = document.getElementById('salasList');
    salasList.innerHTML = '';

    salas.forEach(sala => {
      const listItem = document.createElement('li');
      listItem.textContent = sala.sala_name;
      //listItem.onclick = () => selectDoctor(doctor.id);
      const salaDescription = sala.sala_name + " (" + sala.doctor_name + ")";
      listItem.onclick = () => loadDocumentsFromSala(sala.id, sala.patient_id, salaDescription);
      salasList.appendChild(listItem);
    });

    document.getElementById('sala-list-section').style.display = 'block';
  } catch (error) {
    console.error('Erro ao carregar salas:', error);
    alert('Erro ao carregar a lista de salas.');
  }
}

function loadDocumentsFromSala(salaId, patientId, salaDescription) {
  selectedPatientId = patientId;
  selectedSalaId = salaId;
  document.getElementById('btn-docs').style.display = 'flex';
  document.getElementById('sala-list-name').innerHTML = salaDescription;
  
  fetchDocuments(selectedSalaId);
}
/*
function selectPatient(patientId) {
  selectedPatientId = patientId;
  document.getElementById('btn-docs').style.display = 'flex';
  fetchDocuments();
}

function selectDoctor(doctorId) {
  selectedPatientId = userId;
  document.getElementById('btn-docs').style.display = 'flex';
  
  fetchDocuments();
}*/

// Função para buscar documentos do paciente selecionado
async function fetchDocuments(salaId) {
  try {
    const response = await fetch(`${apiUrl}/documents/${salaId}`, {
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
    if (userRole === 'doctor') {
      document.getElementById('upload-doc-button').style.display = 'flex';
      documentList.innerHTML = ''; // Limpa apenas os itens de documentos, mantendo o botão
      documentList.appendChild(uploadButton); // Adiciona o botão de volta
    } else {
      document.getElementById('upload-doc-button').style.display = 'flex';
      documentList.innerHTML = ''; // Limpa apenas os itens de documentos, mantendo o botão
      documentList.appendChild(uploadButton); // Adiciona o botão de volta
    }

    // Adiciona os documentos à lista
    documents.forEach(doc => {
      const listItem = document.createElement('li');
      listItem.textContent = doc.file_name;
      documentList.appendChild(listItem);
      listItem.onclick = () => openPopUpDocumento(doc);
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error.message);
    alert(error.message);
  }
}

function uploadDeArquivo() {
  document.getElementById('document-section').style.display = 'flex';
}

  

// Função para fazer upload de documento para o paciente selecionado
async function uploadDocument() {
  const fileInput = document.getElementById('file-upload');
  const file = fileInput.files[0];
  const fileName = document.getElementById('file-name').value;

  //if (!file || !selectedSalaId) {
  //  return alert('Selecione um arquivo e um paciente');
 // }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_description', fileName);
  formData.append('doctor_id', userId);
  formData.append('patient_id', selectedPatientId);
  formData.append('sala_id', selectedSalaId);

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

    fetchDocuments(selectedSalaId);
    document.getElementById('file-name').value = '';
  } catch (error) {
    console.error('Erro ao enviar documento:', error.message);
    alert(error.message);
  }
}

  // Exibe a seção apropriada com base na navegação
  function showSection(sectionId) {
    const sections = ['doctors-section', 'patients-section', 'document-section'];
    sections.forEach(id => {
      document.getElementById(id).style.display = id === sectionId ? 'block' : 'none';
    });
  }

  document.getElementById('nav-botoes').style.display = 'none';
  document.getElementById('btn-docs').style.display = 'none';
  document.getElementById('login-section').style.display = 'flex';
  document.getElementById('register-section').style.display = 'none';
  document.getElementById('upload-doc-button').style.display = 'none';

  function showLogin() {
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('register-section').style.display = 'none';
  }
  
  function showRegister() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'flex';
  }

  function closePopUpCreateSala() {
    document.getElementById('create-sala-section').style.display = 'none';
  }

  function openPopUpCreateSala() {
    fetchPacientes();
    document.getElementById('create-sala-section').style.display = 'flex';
  }

  function closePopUpUpload() {
    document.getElementById('document-section').style.display = 'none';
  }

  function openPopUpUpload() {
    document.getElementById('document-section').style.display = 'flex';
  }

  function closePopUpDocumento() {
    document.getElementById('document-popup').style.display = 'none';
  }

  function openPopUpDocumento(doc) {
    document.getElementById('doc-title-popup').textContent = doc.file_name;
    document.getElementById('document-popup').style.display = 'flex';
    const downloadBtn = document.getElementById('view-doc-btn');
    downloadBtn.onclick = () => openDocument(doc.file_path);

    const deleteBtn = document.getElementById('delete-doc-btn');
    deleteBtn.onclick = () => deleteDocument(doc.id);
  }

  function openDocument(path) {
    window.open(`http://localhost:3000${path}`, '_blank');
  }

  async function deleteDocument(documentId) {
    try {
      const response = await fetch(`${apiUrl}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido');
      }
  
      alert('Documento deletado com sucesso!');
      closePopUpDocumento();
      fetchDocuments(selectedSalaId); // Atualiza a lista de documentos após sucesso na exclusão
    } catch (error) {
      console.error('Erro ao deletar documento:', error.message);
      alert(error.message);
    }
  }
  

  async function createSala() {
    const name = document.getElementById('sala_name').value;
    const patientId = document.getElementById('patients-list').value;

    const errorElement = document.getElementById('create-sala-error');
    const successElement = document.getElementById('create-sala-success');
    errorElement.textContent = '';
    successElement.textContent = '';
    
    if (!name || !patientId) {
      errorElement.textContent = 'Todos os campos são obrigatórios.';
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}/salas/create`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, patientId}),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        errorElement.textContent = errorText;
        return;
      }
  
      successElement.textContent = '';
      errorElement.textContent = '';
      document.getElementById('sala_name').value = '';
      closePopUpCreateSala();
      loadSalasByDoctor(); 
    } catch (error) {
      errorElement.textContent = 'Erro ao criar a sala.';
      console.error('Erro no registro:', error);
    }
  }

  async function fetchPacientes() {
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

      console.log("foiiiiiiii");
  
      const pacientes = await response.json();

      // Seleciona o dropdown
      const select = document.getElementById('patients-list');

      // Limpa as opções padrão
      select.innerHTML = '<option value="" disabled selected>Escolha o paciente</option>';

      // Adiciona cada paciente como uma opção
      pacientes.forEach((paciente) => {
        const option = document.createElement('option');
        option.value = paciente.id; // ID do paciente
        option.textContent = paciente.name; // Nome do paciente
        select.appendChild(option);
      });

    } catch (error) {
      console.error('Erro ao carregar salas:', error);
      alert('Erro ao carregar a lista de salas.');
    }
  }