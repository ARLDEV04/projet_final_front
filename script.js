document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Aucun token, redirection vers login
        window.location.href = 'index.html';
        return;
    }

    fetch('https://meteolia-backend.onrender.com/api/auth/verify', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            // Token invalide ou expiré
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        }
        else{
            document.getElementById('user').textContent = data.userFirstName + " " + data.userName;
            document.getElementById('profil').textContent = data.role;
            document.getElementById('u_name').textContent = data.userFirstName + " " + data.userName;
            document.getElementById('u_email').textContent = data.email;

            if (data.role !== 'Administrateur') {
                document.getElementById('gestUsers').remove();
                document.getElementById('gestCapteurs').remove();
                document.getElementById('m-gestUsers').remove();
                document.getElementById('m-gestCapteurs').remove();
            }
            else{
                fetchCapteursStatus();
                setInterval(fetchCapteursStatus, 1000); // rafraîchir toutes les 10 sec
                fetchUsers();
                setInterval(fetchUsers, 5000); // rafraîchir toutes les 10 sec
            }
        }
    })
    .catch(err => {
        console.error('Erreur lors de la vérification du token', err);
        window.location.href = 'form.html';
    });
});

//Deconnexion
async function logout() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('https://meteolia-backend.onrender.com/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            localStorage.removeItem('token'); // Invalide le token côté client
            alert(data.message);
            window.location.href = 'index.html'; // Redirige vers la page de login
        } else {
            alert("Erreur : " + data.message);
        }
    } catch (err) {
        console.error('Erreur pendant la déconnexion :', err);
        alert("Échec de la déconnexion.");
    }
}


//Gestion des action administrateur
//Recuperation des elements du formulaire d'inscription
const addUsersForm = document.getElementById('addUsersForm');

//Evenement
addUsersForm.addEventListener('submit', event => {
    event.preventDefault();
    const addUserName = document.getElementById('gestUserNom').value;
    const addUserFirstName = document.getElementById('gestUserPrenom').value;
    const addUserEmail = document.getElementById('gestUserEmail').value;
    const addUserPassword = document.getElementById('gestUserPassword').value;
    const addUsersRole = document.getElementById('role').value

    addUser(addUserName, addUserFirstName, addUserEmail, addUserPassword, addUsersRole);
})


async function addUser(nom, prenom, email, password, role) {
    const token = localStorage.getItem('token');

    if (!token) {
        // Aucun token, redirection vers login
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('https://meteolia-backend.onrender.com/api/users/addusers', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({nom, prenom, email, password, role }),
        });
        const data = await response.json();
        if (data.success) {
            alert(data.message);
            fetchUsers();
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        console.error(`Erreur lors de l/'ajout: `, error);
    }
}


const socket = io('https://meteolia-backend.onrender.com', {
  transports: ['websocket', 'polling'],
  secure: true,
  reconnection: true
});
socket.on('connect', () => console.log('WebSocket connecté'));
socket.on('disconnect', () => console.log('WebSocket déconnecté'));
socket.on('new-data', data => {
  console.log('Données reçues via websocket :', data);
  updateData(data);
});

//Date et heure courante
function updateDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const time = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const formatted = `${date} ${time}`; // pas de "à"
  document.getElementById('current-datetime').textContent = formatted;
}

// Mise à jour toutes les secondes
setInterval(updateDateTime, 1000);
updateDateTime(); // appel initial direct pour pas attendre 1s

// Indicateur de connexion
function updateConnectionStatus(connected) {
  const statusEl = document.getElementById('connection-status');
  statusEl.innerHTML = connected
    ? `<span class="status-dot bg-green"></span><span> Connecté</span>`
    : `<span class="status-dot bg-red"></span><span> Déconnecté</span>`;
}

// WebSocket
socket.on('connect', () => {
  console.log('WebSocket connecté');
  updateConnectionStatus(true);
});

socket.on('disconnect', () => {
  console.log('WebSocket déconnecté');
  updateConnectionStatus(false);
});


// Application state
let appState = {
    isSidebarOpen: true,
    currentPage: 'dashboard',
    isDarkMode: true,
};

// Chart instances
let temperatureChart;
let humidityChart;

// Titres des pages
const pageTitles = {
    'dashboard': 'Tableau de bord',
    'historique': 'Historique météorologique',
    'perso': 'Espace personnel',
    'gestUtilisateurs': 'Gestion des utilisateurs',
    'gestCapteurs': 'Gestion des capteurs'
};


// Navigation function
function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.style.display = 'block';
    }
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    pageTitle.textContent = pageTitles[pageId] || 'Météolia';
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-blue-400', 'text-white');
    });
    
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
        if (appState.isDarkMode) {
            activeLink.classList.remove('bg-gray-700');
            activeLink.classList.add('bg-blue-400', 'text-white');
        }
        else{
            activeLink.classList.remove('bg-gray-100');
            activeLink.classList.add('bg-blue-400', 'text-white');
        }
    }
    // Update app state
    appState.currentPage = pageId;
}

// Ajouter user
const addForm = document.querySelector('.addForm');
const addBtn = document.getElementById('addUserBtn');
const addTxt = document.getElementById('addTxt');
function showAddForm() {
    if (addForm.classList.contains('hidee')) {
            addForm.classList.replace('hidee', 'showw');
            addTxt.textContent = 'Annuler';
    }
    else{
        addForm.classList.replace('showw', 'hidee');
        addTxt.textContent = 'Ajouter';
    }
}

// Ajouter capteur
// document.getElementById('addCapteurs').addEventListener('click', showAddCapteursForm);
// const addCapteursForm = document.querySelector('.addCapteursForm')
// const addCapteursTxt = document.getElementById('addCapteursTxt');
// function showAddCapteursForm() {
//     if (addCapteursForm.classList.contains('hidee')) {
//             addCapteursForm.classList.replace('hidee', 'showw');
//             addCapteursTxt.textContent = 'Annuler';
//     }
//     else{
//         addCapteursForm.classList.replace('showw', 'hidee');
//         addCapteursTxt.textContent = 'Ajouter';
//     }
// }

//Modifier infos utilisateurs
document.getElementById('updateUser').addEventListener('click', showUpdateUserForm);
const updateUserForm = document.querySelector('.updateUserForm');
const updateUserTxt = document.getElementById('updateUserTxt');
const cc = document.getElementById('UpdateUserI');
function showUpdateUserForm() {
    if (updateUserForm.classList.contains('hidee')) {
        updateUserForm.classList.replace('hidee', 'showw');
        updateUserTxt.textContent = 'Annuler';
        cc.classList.replace('fa-edit', 'none');  
        cc.classList.replace('mr-2', 'nonee');  

    }
    else{
        updateUserForm.classList.replace('showw', 'hidee');
        updateUserTxt.textContent = 'Modifier';
        cc.classList.replace('none', 'fa-edit');  
        cc.classList.replace('nonee', 'mr-3');  

    }
}

// Theme toggle function
function toggleTheme() {
    appState.isDarkMode = !appState.isDarkMode;
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const mobilesidebar = document.getElementById('mobile-sidebar')
    const themeIcon = document.getElementById('theme-icon');
    const themeIcon2 = document.getElementById('theme-icon2');
    const themeTxt = document.getElementById('theme-txt');
    const themeTxt2 = document.getElementById('theme-txt2');
    const sidebarTitle = document.getElementById('sidebar-title');
    const mobilesidebarTitle = document.getElementById('msidebar-title');
    const sidebarFooter = document.getElementById('sidebar-footer');
    const toggleBtn = document.getElementById('toggle-sidebar');
    const mtoggleBtn = document.getElementById('close-mobile-menu');
    const header = document.querySelector('header');
    const headerTitle = document.querySelector('header h1');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const openmside = document.getElementById('mobile-menu-btn');
    const userBtn = document.getElementById('mobile-menu-btn2');
    const cards = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    const weatherIconBgs = document.querySelectorAll('.weather-icon-bg');
    const ths = document.querySelectorAll('th');
    if (appState.isDarkMode) {
        // Mode sombre
        body.className = 'bg-gray-800 text-white font-sans transition-colors duration-300';
        sidebar.className = sidebar.className.replace('bg-gray-100', 'bg-gray-700');
        mobilesidebar.className = mobilesidebar.className.replace('bg-gray-100', 'bg-gray-700')
        themeIcon.className = 'fas fa-sun';
        themeIcon2.className = 'fas fa-sun';
        themeTxt.textContent = 'Mode clair';
        themeTxt2.textContent = 'Mode clair';
        sidebarTitle.className = sidebarTitle.className.replace('text-gray-800', 'text-white');
        mobilesidebarTitle.className = mobilesidebarTitle.className.replace('text-gray-800', 'text-white');
        sidebarFooter.className = sidebarFooter.className.replace('text-gray-600', 'text-gray-300');
        mobilesidebar
        toggleBtn.className = toggleBtn.className.replace('text-gray-600', 'text-gray-300');
        mtoggleBtn.className = mtoggleBtn.className.replace('text-gray-600', 'text-gray-300');
        header.className = header.className.replace('border-gray-300', 'border-gray-700');
        headerTitle.className = headerTitle.className.replace('text-gray-800', 'text-white');
        themeToggleBtn.className = themeToggleBtn.className.replace('text-gray-800', 'text-gray-300');
        openmside.className = openmside.className.replace('text-black', 'text-gray-300');
        userBtn.className = userBtn.className.replace('text-black', 'text-gray-300');
        // Mettre à jour les cartes
        cards.forEach(card => {
            card.className = card.className.replace('bg-gray-100', 'bg-gray-700');
        });
        // Mettre à jour les liens de navigation
        navLinks.forEach(link => {
            link.className = link.className.replace('bg-gray-100', 'bg-gray-700');
        });
        // Mettre à jour l'arrière-plan des icônes météo
        weatherIconBgs.forEach(bg => {
            bg.className = bg.className.replace('bg-gray-100', 'bg-gray-700');
        });
        ths.forEach(th => {
            th.className = th.className.replace('text-gray-800','text-white');
        });
    } else {
        // Mode clair
        body.className = 'bg-gray-200 text-gray-900 font-sans transition-colors duration-300';
        sidebar.className = sidebar.className.replace('bg-gray-700', 'bg-gray-100');
        mobilesidebar.className = mobilesidebar.className.replace('bg-gray-700','bg-gray-100')
        themeIcon.className = 'fas fa-moon';
        themeIcon2.className = 'fas fa-moon';
        themeTxt.textContent = 'Mode sombre';
        themeTxt2.textContent = 'Mode sombre';
        sidebarTitle.className = sidebarTitle.className.replace('text-white', 'text-gray-800');
        mobilesidebarTitle.className = mobilesidebarTitle.className.replace('text-white','text-gray-800');
        sidebarFooter.className = sidebarFooter.className.replace('text-gray-300', 'text-gray-600');
        toggleBtn.className = toggleBtn.className.replace('text-gray-300', 'text-gray-600');
        mtoggleBtn.className = mtoggleBtn.className.replace('text-gray-300', 'text-gray-600');
        header.className = header.className.replace('border-gray-700', 'border-gray-300');
        headerTitle.className = headerTitle.className.replace('text-white', 'text-gray-800');
        themeToggleBtn.className = themeToggleBtn.className.replace('text-gray-300', 'text-gray-800');
        openmside.className = openmside.className.replace('text-gray-300', 'text-black');
        userBtn.className = userBtn.className.replace('text-gray-300', 'text-black');
        // Mettre à jour les cartes
        cards.forEach(card => {
            card.className = card.className.replace('bg-gray-700', 'bg-gray-100');
        });
        // Mettre à jour les liens de navigation
        navLinks.forEach(link => {
            link.className = link.className.replace('bg-gray-700', 'bg-gray-100');
        });
        // Mettre à jour l'arrière-plan des icônes météo
        weatherIconBgs.forEach(bg => {
            bg.className = bg.className.replace('bg-gray-700', 'bg-gray-100');
        });
        ths.forEach(th => {
            th.className = th.className.replace('text-white', 'text-gray-800');
        });   
        console.log(ths)     
    }
    // Mettre à jour les graphiques
    updateChartsTheme();
}

// DOM manipulation functions
function toggleSidebar() {
    appState.isSidebarOpen = !appState.isSidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebarTitle = document.getElementById('sidebar-title');
    const sidebarFooter = document.getElementById('sidebar-footer');
    const navTexts = document.querySelectorAll('.nav-text');
    const navLinks = document.querySelectorAll('nav a');
    if (appState.isSidebarOpen) {
        sidebar.classList.remove('w-20');
        sidebar.classList.add('w-60');
        toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        sidebarTitle.classList.remove('hidden');
        sidebarFooter.classList.remove('hidden');
        navTexts.forEach(text => text.classList.remove('hidden'));
        navLinks.forEach(link => link.classList.remove('justify-center'));
        navLinks.forEach(link => {
            const icon = link.querySelector('i');
            icon.classList.remove('mx-auto');
            icon.classList.add('mr-3');
        });
    } else {
        sidebar.classList.remove('w-60');
        sidebar.classList.add('w-20');
        toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        sidebarTitle.classList.add('hidden');
        sidebarFooter.classList.add('hidden');
        navTexts.forEach(text => text.classList.add('hidden'));
        navLinks.forEach(link => link.classList.add('justify-center'));
        navLinks.forEach(link => {
            const icon = link.querySelector('i');
            icon.classList.remove('mr-3');
            icon.classList.add('mx-auto');
        });
    }
}

function updateChartsTheme() {
    if (!temperatureChart || !humidityChart) return;
    const textColor = appState.isDarkMode ? '#d1d5db' : '#374151';
    const titleColor = appState.isDarkMode ? '#ffffff' : '#1f2937';
    // Mise à jour du thème des graphiques
    const updateChartTheme = (chart) => {
        chart.options.plugins.legend.labels.color = textColor;
        chart.options.plugins.title.color = titleColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.y.title.color = textColor;
        chart.update();
    };
    updateChartTheme(temperatureChart);
    updateChartTheme(humidityChart);
}



//////////////////////// FONCTIONS SYSTEMES ////////////////////////////////////////////
async function fetchData() {
    const token = localStorage.getItem('token');

    try {
        const res = await fetch('https://meteolia-backend.onrender.com/api/data', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) return;

        const data2 = [...data].slice(0, 50);
        const reversed = [...data2].reverse();

        initializeCharts(reversed);
        populateTable(data2);

        const latest = reversed[reversed.length - 1];
        const dateObj = new Date(latest.date);
        const formatted = `Dernière mise à jour : ${dateObj.toLocaleDateString()} à ${dateObj.toLocaleTimeString()}`;
        document.getElementById('lastUpdate').textContent = formatted;

        const ventText = getWindDirectionLabel(latest.directionVent);

        document.getElementById('current-temp').textContent = latest.temperature.toFixed(1);
        document.getElementById('current-humidity').textContent = latest.humidite.toFixed(1);
        document.getElementById('rain-status').textContent = latest.pluviometrie ? 'Il pleut actuellement' : 'Pas de pluie actuellement';
        document.getElementById('weather-status').textContent = latest.pluviometrie ? 'Pluvieux' : 'Ensoleillé';

        const sunIcon = document.getElementById('sun-icon');
        const cloudIcon = document.getElementById('cloud-icon');
        const rainDrops = document.getElementById('rain-drops');

        if (latest.pluviometrie) {
            sunIcon.classList.add('hidden');
            cloudIcon.classList.remove('hidden');
            rainDrops.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            cloudIcon.classList.add('hidden');
            rainDrops.classList.add('hidden');
        }

    } catch (e) {
        console.error('Erreur fetchData:', e);
    }
}
fetchData();
setInterval(fetchData, 60000);


function initializeCharts(data) {
    const textColor = appState.isDarkMode ? '#d1d5db' : '#374151';
    const titleColor = appState.isDarkMode ? '#ffffff' : '#1f2937';
    const labels = data.map(x => new Date(x.date).toLocaleTimeString());
    const temps = data.map(x => x.temperature);
    const hums = data.map(x => x.humidite);

    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: textColor }
            }
        },
        scales: {
            x: { ticks: { color: textColor } },
            y: { 
                ticks: { color: textColor },
                title: { display: true, color: textColor }
            }
        },
        elements: { line: { tension: 0.3 } }
    };

    // Temperature Chart
    if (!temperatureChart) {
        const tempCtx = document.getElementById('temperatureChart').getContext('2d');
        temperatureChart = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature',
                    data: temps,
                    borderColor: '#3b82f6',
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                ...baseOptions,
                plugins: {
                    ...baseOptions.plugins,
                    title: { display: true, text: 'Temperature (°C)', color: titleColor }
                },
                scales: {
                    ...baseOptions.scales,
                    y: {
                        ...baseOptions.scales.y,
                        title: { ...baseOptions.scales.y.title, text: '°C' }
                    }
                }
            }
        });
    }
    else{
        temperatureChart.data.labels = labels;
        temperatureChart.data.datasets[0].data = temps;
        temperatureChart.update();
    }

    // Humidity Chart
    if (!humidityChart) {
        const humCtx = document.getElementById('humidityChart').getContext('2d');
        humidityChart = new Chart(humCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Humidity',
                    data: hums,
                    borderColor: '#60a5fa',
                    backgroundColor: '#60a5fa'
                }]
            },
            options: {
                ...baseOptions,
                plugins: {
                    ...baseOptions.plugins,
                    title: { display: true, text: 'Relative Humidity (%)', color: titleColor }
                },
                scales: {
                    ...baseOptions.scales,
                    y: {
                        ...baseOptions.scales.y,
                        title: { ...baseOptions.scales.y.title, text: '%' }
                    }
                }
            }
        });
    }
    else{
        humidityChart.data.labels = labels;
        humidityChart.data.datasets[0].data = hums;
        humidityChart.update();
    }
}

const tableBody = document.querySelector('#history-table tbody');

function populateTable(data) {
  tableBody.innerHTML = '';
  data.reverse().forEach(x => {
    const row = document.createElement('tr');
    const d = new Date(x.date);
    // const dateTime = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    // const windDir = getWindDirectionLabel(x.directionVent);
    row.innerHTML = `
        <td>${d.toLocaleDateString()}</td>
        <td>${d.toLocaleTimeString()}</td>
        <td class="temp-value">${x.temperature.toFixed(1)} °C</td>
        <td class="hum-value">${x.humidite.toFixed(1)} %</td>
        <td class="pluie">${x.pluviometrie ? 'Oui' : 'Non'}</td>
    `;
    tableBody.prepend(row);
  });
}

//<td class="vitesseV-value">${x.vitesseVent.toFixed(1)} Km/h</td>
//<td class="directionV">${windDir}</td>


//Convertir la direction du vent
function getWindDirectionLabel(degrees) {
    const directions = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function updateData(x) {
    const d = new Date(x.date);
    // const ventText = getWindDirectionLabel(x.directionVent);

    document.getElementById('current-temp').textContent = x.temperature.toFixed(1);
    document.getElementById('current-humidity').textContent = x.humidite.toFixed(1);
    // document.getElementById('current-ws').textContent = x.vitesseVent.toFixed(1);
    // document.getElementById('current-wd').textContent = ventText;
    document.getElementById('rain-status').textContent = x.pluviometrie ? 'Il pleut actuellement' : 'Pas de pluie actuellement';
    document.getElementById('weather-status').textContent = x.pluviometrie ? 'Pluvieux' : 'Ensoleillé';
    const sunIcon = document.getElementById('sun-icon');
    const cloudIcon = document.getElementById('cloud-icon');
    const rainDrops = document.getElementById('rain-drops');
    
    if (x.pluviometrie) {
        // Afficher nuage et pluie
        sunIcon.classList.add('hidden');
        cloudIcon.classList.remove('hidden');
        rainDrops.classList.remove('hidden');
    } else {
        // Afficher soleil
        sunIcon.classList.remove('hidden');
        cloudIcon.classList.add('hidden');
        rainDrops.classList.add('hidden');
    }

    // // Ajout dans le tableau historique (en haut du tableau)
    // const row = document.createElement('tr');
    // row.innerHTML = `
    //     <td>${d.toLocaleDateString()}</td>
    //     <td>${d.toLocaleTimeString()}</td>
    //     <td class="temp-value">${x.temperature.toFixed(1)} °C</td>
    //     <td class="hum-value">${x.humidite.toFixed(1)} %</td>
    //     <td class="pluie">${x.pluviometrie ? 'Oui' : 'Non'}</td>
    // `;
    // tableBody.prepend(row);

    // // <td class="vitesseV-value">${x.vitesseVent.toFixed(1)} Km/h</td>
    // // <td class="directionV">${ventText}</td>

    // // Si plus de 50 lignes, supprimer la dernière
    // if (tableBody.rows.length > 50) {
    //   tableBody.deleteRow(-1); // Supprime la dernière ligne
    // }

    // //Mettre à jour les graphes
    // const label = d.toLocaleDateString()

    // if (temperatureChart && humidityChart) {
    //     temperatureChart.data.labels.push(label);
    //     temperatureChart.data.datasets[0].data.push(x.temperature);
    //     temperatureChart.update();

    //     humidityChart.data.labels.push(label);
    //     humidityChart.data.datasets[0].data.push(x.humidite);
    //     humidityChart.update();
    // }
}

// Fonction d'initialisation de base de la page
function initializeApp() {

    fetchData();

    // Update initial display
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            if (pageId) {
                navigateToPage(pageId);
            }
        });
    });
    // Initialiser avec la page active
    navigateToPage('dashboard');

    //Gestion des boutons (sidebar, thème)
    toggleSidebar();
    document.getElementById('toggle-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('theme-toggle2').addEventListener('click', toggleTheme);
    addBtn.addEventListener('click', showAddForm);
    // addCapteurs.addEventListener('click', showAddCapteursForm);
}

document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-sidebar').classList.remove('translate-x-full');
    document.getElementById('mobile-sidebar').classList.add('translate-x-0');
});

document.getElementById('close-mobile-menu').addEventListener('click', () => {
    document.getElementById('mobile-sidebar').classList.remove('translate-x-0');
    document.getElementById('mobile-sidebar').classList.add('translate-x-full');
});

// Navigation des liens du menu mobile
document.querySelectorAll('#mobile-sidebar .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        if (pageId) {
            navigateToPage(pageId);
            // Fermer le menu mobile
            document.getElementById('mobile-sidebar').classList.remove('translate-x-0');
            document.getElementById('mobile-sidebar').classList.add('translate-x-full');
        }
    });
});

/////////// EXPORT HISTORIQUE ////////////////////
// exproter excel
function exportToExcel() {
  const table = document.getElementById('history-table');
  const wb = XLSX.utils.table_to_book(table, {sheet: "Données"});
  XLSX.writeFile(wb, 'donnees_meteo.xlsx');
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text('Historique des données météo', 14, 15);
  doc.autoTable({
    html: '#history-table',
    startY: 20,
    styles: { fontSize: 8 }
  });
  doc.setFontSize(12);

  // Méthode plus compatible mobile
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'meteo.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

//Gestion capteurs
async function fetchCapteursStatus() {
    const token = localStorage.getItem('token');

    const res = await fetch('https://meteolia-backend.onrender.com/api/capteurs/statut', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const capteurs = await res.json();

    if (!Array.isArray(capteurs)) {
        console.error('Erreur : capteurs n’est pas un tableau.', capteurs);
        return;
    }

    const capteursNbr = capteurs.length;
    const activeCapteur = capteurs.filter(c => c.status === 'actif').length;
    const unactiveCapteur = capteursNbr - activeCapteur;

    document.getElementById('total-capteur').textContent = capteursNbr;
    document.getElementById('active-status').textContent = activeCapteur;
    document.getElementById('unactive-status').textContent = unactiveCapteur;

    const tbody = document.getElementById('capteurs-table');
    tbody.innerHTML = '';
    capteurs.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.capteurId}</td>
            <td>${c.type}</td>
            <td>${new Date(c.lastSeen).toLocaleTimeString()}</td>
            <td style="color: ${c.status === 'actif' ? 'green' : 'red'}">${c.status}</td>
        `;
        tbody.appendChild(tr);
    });
}


async function fetchUsers(){
    const token = localStorage.getItem('token');

    if (!token) {
        // Aucun token, redirection vers login
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('https://meteolia-backend.onrender.com/api/users/getusers', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || "Erreur lors de la récupération des utilisateurs.");
            return;
        }

        const users = data.users;
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = ''; // Vide le tableau actuel

        let countAdmins = 0;
        let countUsers = 0;
        let countOnline = 0;

        users.forEach(user => {
            if (user.role === 'Administrateur') countAdmins++;
            else if (user.role === 'Utilisateur') countUsers++;

            // Incrémenter si en ligne
            if (user.isConnected  === true) countOnline++;     

            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-gray-600');
            row.innerHTML = `
                <td>${user.nom}</td>
                <td>${user.prenom}</td>
                <td>${user.email}</td>
                <td>••••••••••••••••••••</td> <!-- mot de passe masqué -->
                <td>${user.role}</td>
                <td ${user.isConnected === true ? 'text-green-400' : 'text-gray-400'}">
                    ${user.isConnected === true ? 'En ligne' : 'Hors ligne'}
                </td>
                <td class="p-3 text-white">
                    <button class="text-sm text-blue-400 hover:underline">Modifier</button>
                    <button class="text-sm text-red-400 hover:underline ml-2">Supprimer</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('count-admins').textContent = countAdmins;
        document.getElementById('count-users').textContent = countUsers;
        document.getElementById('count-active').textContent = countOnline;

    } catch (err) {
        console.error("Erreur côté frontend :", err);
        alert("Une erreur est survenue lors de la connexion au serveur.");
    }
};  

// Au demarrage de l'application
document.addEventListener('DOMContentLoaded', initializeApp);
