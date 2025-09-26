// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDHocSWFnQvODBw_NIs2ndLOcJVbWrIfh0",
    authDomain: "fir-47748.firebaseapp.com",
    projectId: "fir-47748",
    storageBucket: "fir-47748.firebasestorage.app",
    messagingSenderId: "164489738468",
    appId: "1:164489738468:web:a118d1897025e00d3414f1"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Verificar conexión con Firebase
console.log('🔧 Configuración de Firebase:', firebaseConfig);

// Probar conexión básica
db.collection('test').doc('connection').get()
    .then((doc) => {
        console.log('✅ Firebase Firestore conectado correctamente');
        console.log('📊 Base de datos disponible:', db.app.name);
    })
    .catch((err) => {
        console.error('❌ Error conectando con Firebase:', err);
        console.error('🔍 Detalles del error:', {
            code: err.code,
            message: err.message,
            details: err.details
        });
    });

// Variables globales
let currentBoard = 'Tablero 1';
let boards = ['Tablero 1'];
let tasks = [];

// Elementos del DOM
const newTaskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const newBoardInput = document.getElementById('newBoardInput');
const addBoardBtn = document.getElementById('addBoardBtn');
const pendingTasksContainer = document.getElementById('pendingTasks');
const completedTasksContainer = document.getElementById('completedTasks');
const currentBoardTitle = document.getElementById('currentBoardTitle');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar con datos de ejemplo
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    console.log('🚀 Inicializando aplicación...');
    
    try {
        // Cargar datos desde Firebase
        await loadDataFromFirebase();
        console.log('✅ Datos cargados desde Firebase');
    } catch (error) {
        console.log('⚠️ Error cargando desde Firebase, usando datos locales');
        // Datos de ejemplo como fallback
        tasks = [
            { id: '1', text: 'Tarea 1', completed: false, board: 'Tablero 1', createdAt: new Date() },
            { id: '2', text: 'Tarea 2', completed: false, board: 'Tablero 1', createdAt: new Date() }
        ];
        boards = ['Tablero 1'];
    }
    
    // Renderizar la UI
    renderBoards();
    renderTasks();
    
    console.log('✅ Aplicación inicializada correctamente');
}

function setupEventListeners() {
    // Agregar nueva tarea
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Agregar nuevo tablero
    addBoardBtn.addEventListener('click', addBoard);
    newBoardInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addBoard();
        }
    });
}

// Funciones de tareas
function addTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText === '') return;

    const task = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        board: currentBoard,
        createdAt: new Date()
    };

    tasks.push(task);
    newTaskInput.value = '';
    
    // Guardar en Firebase
    saveTaskToFirebase(task);
    
    // Actualizar la UI
    renderTasks();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        
        // Actualizar en Firebase
        updateTaskInFirebase(task);
        
        // Actualizar la UI
        renderTasks();
    }
}

function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        
        // Eliminar de Firebase
        deleteTaskFromFirebase(taskId);
        
        // Actualizar la UI
        renderTasks();
    }
}

function renderTasks() {
    const pendingTasks = tasks.filter(t => !t.completed && t.board === currentBoard);
    const completedTasks = tasks.filter(t => t.completed && t.board === currentBoard);

    // Actualizar el subtítulo con información del tablero
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        const totalTasks = pendingTasks.length + completedTasks.length;
        subtitle.textContent = `${totalTasks} tareas en este tablero`;
    }

    // Renderizar tareas pendientes
    pendingTasksContainer.innerHTML = '';
    if (pendingTasks.length === 0) {
        pendingTasksContainer.innerHTML = '<div class="text-muted text-center py-3">No hay tareas pendientes</div>';
    } else {
        pendingTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            pendingTasksContainer.appendChild(taskElement);
        });
    }

    // Renderizar tareas completadas
    completedTasksContainer.innerHTML = '';
    if (completedTasks.length === 0) {
        completedTasksContainer.innerHTML = '<div class="text-muted text-center py-3">No hay tareas completadas</div>';
    } else {
        completedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            completedTasksContainer.appendChild(taskElement);
        });
    }
    
    console.log(`📊 Tablero "${currentBoard}": ${pendingTasks.length} pendientes, ${completedTasks.length} completadas`);
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item d-flex align-items-center justify-content-between ${task.completed ? 'completed' : ''}`;
    
    taskDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <input type="checkbox" class="form-check-input me-2" ${task.completed ? 'checked' : ''}>
            <span>${task.text}</span>
        </div>
        <button class="btn btn-danger btn-sm">Eliminar</button>
    `;
    
    // Agregar event listeners
    const checkbox = taskDiv.querySelector('input[type="checkbox"]');
    const deleteBtn = taskDiv.querySelector('button');
    
    checkbox.addEventListener('change', () => toggleTask(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    return taskDiv;
}

// Funciones de tableros
function addBoard() {
    const boardName = newBoardInput.value.trim();
    if (boardName === '') {
        alert('Por favor ingresa un nombre para el tablero');
        return;
    }
    
    if (boards.includes(boardName)) {
        alert('Ya existe un tablero con ese nombre');
        return;
    }

    boards.push(boardName);
    newBoardInput.value = '';
    
    // Guardar en Firebase
    saveBoardToFirebase(boardName);
    
    // Cambiar al nuevo tablero automáticamente
    switchBoard(boardName);
    
    console.log(`✅ Nuevo tablero creado: ${boardName}`);
}

function switchBoard(boardName) {
    currentBoard = boardName;
    // Actualizar el título en el contenido principal
    const mainTitle = document.querySelector('.main-title');
    if (mainTitle) {
        mainTitle.textContent = boardName;
    }
    renderBoards();
    renderTasks();
    console.log(`🔄 Cambiado a tablero: ${boardName}`);
}

function renderBoards() {
    const boardsContainer = document.querySelector('.sidebar .mb-4');
    
    // Limpiar tableros existentes (excepto el input)
    const existingBoards = boardsContainer.querySelectorAll('.board-item');
    existingBoards.forEach(board => {
        if (!board.querySelector('input')) {
            board.remove();
        }
    });
    
    // Agregar tableros
    boards.forEach(board => {
        const boardElement = document.createElement('div');
        boardElement.className = `board-item ${board === currentBoard ? 'active' : ''}`;
        boardElement.innerHTML = `<span>${board}</span>`;
        boardElement.addEventListener('click', () => switchBoard(board));
        
        // Insertar antes del input de nuevo tablero
        const inputContainer = boardsContainer.querySelector('.d-flex.mt-2');
        if (inputContainer) {
            boardsContainer.insertBefore(boardElement, inputContainer);
        } else {
            boardsContainer.appendChild(boardElement);
        }
    });
    
    console.log(`📋 Tableros renderizados: ${boards.length}`);
}

// Funciones de Firebase
async function loadDataFromFirebase() {
    console.log('📥 Cargando datos desde Firebase...');
    
    try {
        // Verificar si Firestore está disponible
        if (!db) {
            throw new Error('Firestore no está inicializado');
        }
        
        // Cargar tableros
        console.log('📋 Cargando tableros...');
        const boardsSnapshot = await db.collection('boards').get();
        boards = ['Tablero 1']; // Siempre incluir el tablero por defecto
        
        if (!boardsSnapshot.empty) {
            boardsSnapshot.forEach(doc => {
                const boardData = doc.data();
                if (boardData.name && !boards.includes(boardData.name)) {
                    boards.push(boardData.name);
                }
            });
        }
        
        console.log('📋 Tableros cargados:', boards);
        
        // Cargar tareas
        console.log('✅ Cargando tareas...');
        const tasksSnapshot = await db.collection('tasks').get();
        tasks = [];
        
        if (!tasksSnapshot.empty) {
            tasksSnapshot.forEach(doc => {
                const taskData = doc.data();
                tasks.push({
                    id: doc.id,
                    text: taskData.text || 'Tarea sin texto',
                    completed: taskData.completed || false,
                    board: taskData.board || 'Tablero 1',
                    createdAt: taskData.createdAt ? taskData.createdAt.toDate() : new Date()
                });
            });
        }
        
        console.log('✅ Tareas cargadas:', tasks.length);
        
        // Si no hay datos, usar datos de ejemplo
        if (tasks.length === 0 && boards.length === 1) {
            console.log('📝 No hay datos en Firebase, usando datos locales...');
            tasks = [
                { id: '1', text: 'Tarea de ejemplo 1', completed: false, board: 'Tablero 1', createdAt: new Date() },
                { id: '2', text: 'Tarea de ejemplo 2', completed: false, board: 'Tablero 1', createdAt: new Date() }
            ];
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos desde Firebase:', error);
        console.log('🔄 Usando datos locales como fallback...');
        
        // Usar datos locales como fallback
        tasks = [
            { id: '1', text: 'Tarea local 1', completed: false, board: 'Tablero 1', createdAt: new Date() },
            { id: '2', text: 'Tarea local 2', completed: false, board: 'Tablero 1', createdAt: new Date() }
        ];
        boards = ['Tablero 1'];
        
        throw error;
    }
}

async function createSampleData() {
    const sampleTasks = [
        { id: '1', text: 'Tarea de ejemplo 1', completed: false, board: 'Tablero 1', createdAt: new Date() },
        { id: '2', text: 'Tarea de ejemplo 2', completed: false, board: 'Tablero 1', createdAt: new Date() }
    ];
    
    for (const task of sampleTasks) {
        await saveTaskToFirebase(task);
    }
    
    tasks = sampleTasks;
}

async function saveTaskToFirebase(task) {
    try {
        await db.collection('tasks').doc(task.id).set(task);
        console.log('✅ Tarea guardada en Firebase:', task.text);
    } catch (error) {
        console.error('❌ Error guardando tarea en Firebase:', error.message);
        console.log('💾 Guardando localmente únicamente');
    }
}

async function updateTaskInFirebase(task) {
    try {
        await db.collection('tasks').doc(task.id).update({
            completed: task.completed
        });
        console.log('Tarea actualizada en Firebase');
    } catch (error) {
        console.log('Firebase no disponible, actualizando localmente');
    }
}

async function deleteTaskFromFirebase(taskId) {
    try {
        await db.collection('tasks').doc(taskId).delete();
        console.log('Tarea eliminada de Firebase');
    } catch (error) {
        console.log('Firebase no disponible, eliminando localmente');
    }
}

async function saveBoardToFirebase(boardName) {
    try {
        await db.collection('boards').doc(boardName).set({
            name: boardName,
            createdAt: new Date()
        });
        console.log('Tablero guardado en Firebase');
    } catch (error) {
        console.log('Firebase no disponible, guardando localmente');
    }
}

// Inicializar la aplicación
console.log('Aplicación Monday Clone iniciada');
