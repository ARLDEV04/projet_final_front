// Application state
let appState = {
    isSidebarOpen: true,
    currentPage: 'dashboard',
    isDarkMode: true,
    weatherData: {
        temperature: 15,
        humidity: 65,
        isRaining: false
    },
    chartData: []
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
    const userBtn = document.getElementById('mbtn');
    const openmside = document.getElementById('mobile-menu-btn');
    const cards = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    const weatherIconBgs = document.querySelectorAll('.weather-icon-bg');
    if (appState.isDarkMode) {
        // Mode sombre
        body.className = 'bg-gray-800 text-white font-sans transition-colors duration-300';
        sidebar.className = sidebar.className.replace('bg-gray-100', 'bg-gray-700');
        mobilesidebar.className = mobilesidebar.className.replace('bg-gray-100', 'bg-gray-700')
        themeIcon.className = 'fas fa-sun mr-3';
        themeIcon2.className = 'fas fa-sun';
        themeTxt.textContent = 'Mode clair';
        themeTxt2.textContent = 'Mode clair';
        sidebarTitle.className = sidebarTitle.className.replace('text-gray-800', 'text-white');
        mobilesidebarTitle.className = mobilesidebarTitle.className.replace('text-gray-800', 'text-white');
        sidebarFooter.className = sidebarFooter.className.replace('text-gray-600', 'text-gray-300');
        mobilesidebar
        toggleBtn.className = toggleBtn.className.replace('text-gray-600', 'text-gray-300');
        mtoggleBtn.className = toggleBtn.className.replace('text-gray-600', 'text-gray-300');
        header.className = header.className.replace('border-gray-300', 'border-gray-700');
        headerTitle.className = headerTitle.className.replace('text-gray-800', 'text-white');
        themeToggleBtn.className = themeToggleBtn.className.replace('text-gray-800', 'text-gray-300');
        userBtn.className = userBtn.className.replace('text-black', 'text-gray-300');
        openmside.className = openmside.className.replace('text-black', 'text-gray-300');
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
    } else {
        // Mode clair
        body.className = 'bg-gray-200 text-gray-900 font-sans transition-colors duration-300';
        sidebar.className = sidebar.className.replace('bg-gray-700', 'bg-gray-100');
        mobilesidebar.className = mobilesidebar.className.replace('bg-gray-700','bg-gray-100')
        themeIcon.className = 'fas fa-moon mr-3';
        themeIcon2.className = 'fas fa-moon';
        themeTxt.textContent = 'Mode sombre';
        themeTxt2.textContent = 'Mode sombre';
        sidebarTitle.className = sidebarTitle.className.replace('text-white', 'text-gray-800');
        mobilesidebarTitle.className = mobilesidebarTitle.className.replace('text-white','text-gray-800');
        sidebarFooter.className = sidebarFooter.className.replace('text-gray-300', 'text-gray-600');
        toggleBtn.className = toggleBtn.className.replace('text-gray-300', 'text-gray-600');
        mtoggleBtn.className = toggleBtn.className.replace('text-gray-300', 'text-gray-600');
        header.className = header.className.replace('border-gray-700', 'border-gray-300');
        headerTitle.className = headerTitle.className.replace('text-white', 'text-gray-800');
        themeToggleBtn.className = themeToggleBtn.className.replace('text-gray-300', 'text-gray-800');
        userBtn.className = userBtn.className.replace('text-gray-300', 'text-black');
        openmside.className = openmside.className.replace('text-gray-300', 'text-black');
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
    }
    // Mettre à jour les graphiques
    updateChartsTheme();
}

// Utility functions
function generateRandomWeather() {
    return {
        temperature: Math.floor(Math.random() * 15 + 10),
        humidity: Math.floor(Math.random() * 40 + 50),
        isRaining: Math.random() > 0.4
    };
}

function generateInitialChartData(count = 10) {
    const data = [];
    const currentTime = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const timeStamp = new Date(currentTime.getTime() - (count - 1 - i) * 5000);
        const timeString = timeStamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        data.push({
            time: timeString,
            temperature: Math.floor(Math.random() * 15 + 10),
            humidity: Math.floor(Math.random() * 40 + 50)
        });
    }
    return data;
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

function updateWeatherDisplay() {
    document.getElementById('current-temp').textContent = appState.weatherData.temperature;
    document.getElementById('current-humidity').textContent = appState.weatherData.humidity;
    document.getElementById('rain-status').textContent = appState.weatherData.isRaining ? 'Il pleut actuellement' : 'Pas de pluie actuellement';
    document.getElementById('weather-status').textContent = appState.weatherData.isRaining ? 'Pluvieux' : 'Ensoleillé';
    const sunIcon = document.getElementById('sun-icon');
    const cloudIcon = document.getElementById('cloud-icon');
    const rainDrops = document.getElementById('rain-drops');
    
    if (appState.weatherData.isRaining) {
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

function updateCharts() {
    const labels = appState.chartData.map(d => d.time);
    const temperatureData = appState.chartData.map(d => d.temperature);
    const humidityData = appState.chartData.map(d => d.humidity);

    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = temperatureData;
    temperatureChart.update();
    humidityChart.data.labels = labels;
    humidityChart.data.datasets[0].data = humidityData;
    humidityChart.update();
}

function initializeCharts() {
    const textColor = appState.isDarkMode ? '#d1d5db' : '#374151';
    const titleColor = appState.isDarkMode ? '#ffffff' : '#1f2937';
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
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    temperatureChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature',
                data: [],
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
    // Humidity Chart
    const humCtx = document.getElementById('humidityChart').getContext('2d');
    humidityChart = new Chart(humCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humidity',
                data: [],
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

function updateData() {
    // Update weather data
    appState.weatherData = generateRandomWeather();
    updateWeatherDisplay();
    // Update chart data
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newDataPoint = {
        time: timeString,
        temperature: appState.weatherData.temperature,
        humidity: appState.weatherData.humidity
    };
    appState.chartData = [...appState.chartData.slice(1), newDataPoint];
    updateCharts();
}

// Initialize application
function initializeApp() {
    // Initialize chart data
    appState.chartData = generateInitialChartData();
    // Initialize charts
    initializeCharts();
    // Update initial display
    updateWeatherDisplay();
    updateCharts();
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            if (pageId) {
                navigateToPage(pageId);
            }
        });
    });
    // Initialize with dashboard page active
    navigateToPage('dashboard');
    // Set up event listeners
    toggleSidebar();
    document.getElementById('toggle-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('theme-toggle2').addEventListener('click', toggleTheme);

    // Set up data update interval
    setInterval(updateData, 5000);
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




// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
