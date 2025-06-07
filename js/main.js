const API_KEY = 'fe0d7d0e-c29f-468d-99cb-292d008c5261';
const CITY = 'Samarinda';
const COUNTRY = 'Indonesia';
const STATE = 'East Kalimantan';
const LATITUDE = -0.5016;
const LONGITUDE = 117.1537;

let currentAQI = 0;
let currentWeather = null; // Tambahkan variabel untuk cuaca

// Tambahkan fungsi untuk mendapatkan ikon dan deskripsi cuaca
function getWeatherIcon(iconCode) {
    const weatherIcons = {
        '01d': '☀️', // Cerah (siang)
        '01n': '🌙', // Cerah (malam)
        '02d': '⛅', // Berawan sebagian (siang)
        '02n': '☁️', // Berawan sebagian (malam)
        '03d': '☁️', // Berawan
        '03n': '☁️', // Berawan
        '04d': '☁️', // Berawan tebal
        '04n': '☁️', // Berawan tebal
        '09d': '🌧️', // Hujan ringan
        '09n': '🌧️', // Hujan ringan
        '10d': '🌦️', // Hujan (siang)
        '10n': '🌧️', // Hujan (malam)
        '11d': '⛈️', // Badai petir
        '11n': '⛈️', // Badai petir
        '13d': '🌨️', // Salju
        '13n': '🌨️', // Salju
        '50d': '🌫️', // Kabut
        '50n': '🌫️'  // Kabut
    };
    return weatherIcons[iconCode] || '❓';
}

function getWeatherDescription(iconCode) {
    const weatherDesc = {
        '01d': 'Cerah',
        '01n': 'Malam Cerah',
        '02d': 'Berawan Sebagian',
        '02n': 'Berawan Sebagian (Malam)',
        '03d': 'Berawan',
        '03n': 'Berawan',
        '04d': 'Berawan Tebal',
        '04n': 'Berawan Tebal',
        '09d': 'Hujan Ringan',
        '09n': 'Hujan Ringan',
        '10d': 'Hujan',
        '10n': 'Hujan',
        '11d': 'Badai Petir',
        '11n': 'Badai Petir',
        '13d': 'Salju',
        '13n': 'Salju',
        '50d': 'Berkabut',
        '50n': 'Berkabut'
    };
    return weatherDesc[iconCode] || 'Tidak Diketahui';
}

// Fungsi untuk mendapatkan ikon AQI berdasarkan nilai
function getAQIEmoji(aqi) {
    if (aqi <= 50) return '😊'; // Good
    if (aqi <= 100) return '😐'; // Moderate
    if (aqi <= 150) return '😟'; // Unhealthy for Sensitive Groups
    if (aqi <= 200) return '😷'; // Unhealthy
    if (aqi <= 300) return '🤢'; // Very Unhealthy
    return '☠️'; // Hazardous
}

// Fungsi untuk mendapatkan deskripsi suhu
function getTempDescription(temp) {
    if (temp < 20) return 'Sejuk';
    if (temp <= 25) return 'Nyaman';
    if (temp <= 30) return 'Hangat';
    if (temp <= 35) return 'Panas';
    return 'Sangat Panas';
}

// Fungsi untuk mendapatkan deskripsi kelembaban
function getHumidityDescription(humidity) {
    if (humidity < 30) return 'Sangat Kering';
    if (humidity <= 50) return 'Kering';
    if (humidity <= 70) return 'Ideal';
    if (humidity <= 85) return 'Lembab';
    return 'Sangat Lembab';
}

// Fungsi untuk mendapatkan deskripsi tekanan udara
function getPressureDescription(pressure) {
    if (pressure < 1000) return 'Rendah (Potensi Cuaca Tidak Stabil)';
    if (pressure <= 1010) return 'Normal';
    if (pressure <= 1025) return 'Tinggi (Cuaca Cerah)';
    return 'Sangat Tinggi (Cuaca Sangat Cerah)';
}

// Fungsi untuk mendapatkan deskripsi kecepatan angin
function getWindDescription(speed) {
    if (speed < 0.3) return 'Sangat Tenang';
    if (speed <= 1.5) return 'Sepoi Lemah';
    if (speed <= 3.4) return 'Sepoi Normal';
    if (speed <= 5.5) return 'Hembusan Sedang';
    if (speed <= 8.0) return 'Hembusan Kuat';
    return 'Kencang';
}

// Fungsi untuk mengambil data terkini
async function getCurrentData() {
    try {
        const response = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${LATITUDE}&lon=${LONGITUDE}&key=${API_KEY}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            // Set data global
            currentAQI = data.data.current.pollution.aqius;
            currentWeather = data.data.current.weather;
            
            // Debug logs
            console.log('Current AQI:', currentAQI);
            console.log('Current Weather:', currentWeather);
            
            displayCurrentData(data.data);
            initMap();
        } else {
            console.error('API Response Error:', data);
            document.getElementById('currentAirQuality').innerHTML = 'Tidak ada data tersedia untuk lokasi ini';
        }
    } catch (error) {
        console.error('API Request Error:', error);
        document.getElementById('currentAirQuality').innerHTML = 'Error mengambil data: ' + error.message;
    }
}

// Fungsi untuk menampilkan data terkini
function displayCurrentData(cityData) {
    const currentAirQuality = document.getElementById('currentAirQuality');
    
    if (cityData.current) {
        const current = cityData.current;
        const pollution = current.pollution;
        const weather = current.weather;
        const location = cityData.location || { coordinates: [LONGITUDE, LATITUDE] };
        
        // Get pollutant concentrations
        const pm25Conc = pollution.p2 ? pollution.p2.conc : 'N/A';
        const pm10Conc = pollution.p1 ? pollution.p1.conc : 'N/A';
        
        let aqiClass = '';
        const aqi = pollution.aqius;
        if (aqi <= 50) aqiClass = 'aqi-good';
        else if (aqi <= 100) aqiClass = 'aqi-moderate';
        else if (aqi <= 150) aqiClass = 'aqi-unhealthy';
        else if (aqi <= 200) aqiClass = 'aqi-very-unhealthy';
        else aqiClass = 'aqi-hazardous';
        
        let aqiText = '';
        if (aqi <= 50) aqiText = 'Baik';
        else if (aqi <= 100) aqiText = 'Sedang';
        else if (aqi <= 150) aqiText = 'Tidak Sehat untuk Kelompok Sensitif';
        else if (aqi <= 200) aqiText = 'Tidak Sehat';
        else aqiText = 'Sangat Tidak Sehat';
        
        // Get date in a more readable format
        const lastUpdated = new Date(pollution.ts);
        const formattedDate = lastUpdated.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const formattedTime = lastUpdated.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Get descriptions for each weather parameter
        const tempDesc = getTempDescription(weather.tp);
        const humidityDesc = getHumidityDescription(weather.hu);
        const pressureDesc = getPressureDescription(weather.pr);
        const windDesc = getWindDescription(weather.ws);
        
        // Check if weather is rain-related and add animation class
        const isRain = weather.ic.includes('09') || weather.ic.includes('10') || weather.ic.includes('11');
        const weatherIconClass = isRain ? 'rain-animation' : '';
        
        currentAirQuality.innerHTML = `
                    <div class="mb-4">
                        <h3 class="lokasi-info">Lokasi: ${cityData.city}, ${cityData.state}, ${cityData.country}</h3>
                        <div class="d-inline-flex align-items-center ${aqiClass} rounded-pill px-4 py-2 mb-3 aqi-indicator-animation">
                            AQI: <span id="aqiValue" class="ms-1 fw-bold">${pollution.aqius}</span> - ${aqiText} <span class="ms-2 fs-4">${getAQIEmoji(aqi)}</span>
                        </div>
                    </div>
                    
                    <div class="text-center my-4">
                        <div class="weather-icon-container ${weatherIconClass}">
                            <div class="weather-icon-large">${getWeatherIcon(weather.ic)}</div>
                        </div>
                        <h4 class="weather-description mt-3">${getWeatherDescription(weather.ic)}</h4>
                    </div>
                    
                    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 my-3">
                        <div class="col weather-card-animation">
                            <div class="card h-100 weather-card">
                                <div class="card-body text-center">
                                    <div class="display-6 mb-3">🌡️</div>
                                    <h5 class="card-title fw-bold">Suhu</h5>
                                    <p class="mb-1"><span id="tempValue" class="weather-value">${weather.tp}</span><span class="weather-value">&deg;C</span></p>
                                    <p class="weather-desc">${tempDesc}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col weather-card-animation">
                            <div class="card h-100 weather-card">
                                <div class="card-body text-center">
                                    <div class="display-6 mb-3">💧</div>
                                    <h5 class="card-title fw-bold">Kelembaban</h5>
                                    <p class="mb-1"><span id="humidityValue" class="weather-value">${weather.hu}</span><span class="weather-value">%</span></p>
                                    <p class="weather-desc">${humidityDesc}</p>
                                    <small class="weather-range">(Rentang normal: 0% - 100%)</small>
                                </div>
                            </div>
                        </div>
                        <div class="col weather-card-animation">
                            <div class="card h-100 weather-card">
                                <div class="card-body text-center">
                                    <div class="display-6 mb-3">🧭</div>
                                    <h5 class="card-title fw-bold">Tekanan Udara</h5>
                                    <p class="mb-1"><span id="pressureValue" class="weather-value">${weather.pr}</span><span class="weather-value"> hPa</span></p>
                                    <p class="weather-desc">${pressureDesc}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col weather-card-animation">
                            <div class="card h-100 weather-card">
                                <div class="card-body text-center">
                                    <div class="display-6 mb-3">💨</div>
                                    <h5 class="card-title fw-bold">Kecepatan Angin</h5>
                                    <p class="mb-1"><span id="windValue" class="weather-value">${weather.ws}</span><span class="weather-value"> m/s</span></p>
                                    <p class="weather-desc">${windDesc}</p>
                                    <small class="weather-range">(Angin normal: 0.3 - 3.4 m/s)</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 border-top pt-3">
                        <div class="row">
                            <div class="col-md-6">
                                <p class="text-secondary mb-1">
                                    <i class="bi bi-info-circle me-1"></i> Polutan Utama: ${getPollutantName(pollution.mainus)}
                                </p>
                            </div>
                            <div class="col-md-6 text-md-end">
                                <p class="text-muted mb-0">
                                    <i class="bi bi-clock me-1"></i> Terakhir diperbarui: ${formattedDate}, ${formattedTime}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
        
        // Initialize CountUp animations with error handling
        setTimeout(() => {
            try {
                // Check if CountUp is available
                if (typeof CountUp === 'function') {
                    // AQI counter
                    new CountUp('aqiValue', 0, pollution.aqius, 0, 2, {
                        useEasing: true,
                        useGrouping: true,
                        separator: ',',
                        decimal: '.'
                    }).start();
                    
                    // Temperature counter
                    new CountUp('tempValue', 0, weather.tp, 1, 2, {
                        useEasing: true,
                        decimal: '.'
                    }).start();
                    
                    // Humidity counter
                    new CountUp('humidityValue', 0, weather.hu, 0, 2, {
                        useEasing: true
                    }).start();
                    
                    // Pressure counter
                    new CountUp('pressureValue', 900, weather.pr, 0, 2, {
                        useEasing: true
                    }).start();
                    
                    // Wind counter
                    new CountUp('windValue', 0, weather.ws, 2, 2, {
                        useEasing: true,
                        decimal: '.'
                    }).start();
                } else {
                    console.warn('CountUp library not loaded properly, animations disabled');
                }
            } catch (error) {
                console.error('Error initializing CountUp animations:', error);
            }
        }, 500);
        
    } else {
        currentAirQuality.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> Data pengukuran tidak tersedia
            </div>
        `;
    }
}

// Fungsi helper untuk mendapatkan nama polutan
function getPollutantName(pollutantCode) {
    const pollutants = {
        'p2': 'PM2.5 (Partikel halus)',
        'p1': 'PM10 (Partikel kasar)',
        'o3': 'Ozon (O₃)',
        'n2': 'Nitrogen Dioksida (NO₂)',
        's2': 'Sulfur Dioksida (SO₂)',
        'co': 'Karbon Monoksida (CO)'
    };
    return pollutants[pollutantCode] || pollutantCode;
}

// Fungsi untuk mengambil data historis
async function getHistoricalData() {
    const historyContainer = document.getElementById('historyData');
    try {
        // Mengambil data untuk 3 hari terakhir
        const dates = [];
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        historyContainer.innerHTML = dates.map(date => `
                    <!-- <div class="history-card">
                        <h3>Data ${date}</h3>
                        <p>Catatan: Data historis memerlukan langganan API premium</p>
                    </div> -->
                `).join('');
            
        } catch (error) {
            console.error('Error:', error);
            historyContainer.innerHTML = 'Error mengambil data historis';
        }
    }
    
    // Fungsi untuk menginisialisasi peta
    function initMap() {
        const samarindaCenter = [-0.5016, 117.1537];
        
        // Check if we're on mobile
        const isMobile = window.innerWidth <= 480;
        const initialZoom = isMobile ? 11 : 12;
        
        // Add animation class to map container
        document.getElementById('map').classList.add('map-animation');
        
        const map = L.map('map').setView(samarindaCenter, initialZoom);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Get descriptions for map popup
        const tempDesc = getTempDescription(currentWeather.tp);
        const humidityDesc = getHumidityDescription(currentWeather.hu);
        const pressureDesc = getPressureDescription(currentWeather.pr);
        const windDesc = getWindDescription(currentWeather.ws);
        
        // Buat konten popup yang lebih informatif dengan ikon cuaca
        const popupContent = `
                <div>
                    <h3>Kualitas Udara & Cuaca</h3>
                    <div class="mb-3">
                        <strong style="color: ${getAQIColor(currentAQI)};">AQI: ${currentAQI}</strong> 
                        <span class="fs-1">${getAQIEmoji(currentAQI)}</span>
                    </div>
                    <div class="text-center mb-3">
                        <div class="fs-1">${getWeatherIcon(currentWeather.ic)}</div>
                        <strong>${getWeatherDescription(currentWeather.ic)}</strong>
                    </div>
                    <div class="mb-2">
                        <div><strong>🌡️ Suhu:</strong> ${currentWeather.tp}°C</div>
                        <div class="text-secondary">${tempDesc}</div>
                    </div>
                    <div class="mb-2">
                        <div><strong>💧 Kelembaban:</strong> ${currentWeather.hu}%</div>
                        <div class="text-secondary">${humidityDesc} (0% - 100%)</div>
                    </div>
                    <div class="mb-2">
                        <div><strong>🧭 Tekanan Udara:</strong> ${currentWeather.pr} hPa</div>
                        <div class="text-secondary">${pressureDesc}</div>
                    </div>
                    <div>
                        <div><strong>💨 Kecepatan Angin:</strong> ${currentWeather.ws} m/s</div>
                        <div class="text-secondary">${windDesc} (Normal: 0.3 - 3.4 m/s)</div>
                    </div>
                </div>
            `;
        
        // Tambahkan marker dengan popup yang lebih informatif
        const marker = L.marker(samarindaCenter)
        .bindPopup(popupContent, { minWidth: 250 })
        .addTo(map);
        
        // Buka popup secara otomatis
        marker.openPopup();
        
        // Tambahkan circle untuk area pengukuran
        const circle = L.circle(samarindaCenter, {
            color: getAQIColor(currentAQI),
            fillColor: getAQIColor(currentAQI),
            fillOpacity: 0.2,
            radius: 5000
        }).addTo(map);
        
        // Tambahkan legend dengan informasi tambahan
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Kualitas Udara</h4>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #009966"></div>
                        <span>Baik (0-50) 😊</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #ffde33"></div>
                        <span>Sedang (51-100) 😐</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #ff9933"></div>
                        <span>Tidak Sehat untuk Kelompok Sensitif (101-150) 😟</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #cc0033"></div>
                        <span>Tidak Sehat (151-200) 😷</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #660099"></div>
                        <span>Sangat Tidak Sehat (>200) 🤢</span>
                    </div>
                `;
            return div;
        };
        legend.addTo(map);
    }
    
    // Fungsi untuk mendapatkan warna berdasarkan AQI
    function getAQIColor(aqi) {
        if (aqi <= 50) return '#009966';
        if (aqi <= 100) return '#ffde33';
        if (aqi <= 150) return '#ff9933';
        if (aqi <= 200) return '#cc0033';
        return '#660099';
    }
    
    // Update event listener
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize AOS animations
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
        
        getCurrentData();
        getHistoricalData();
        
        // Add animation to title
        const headerTitle = document.querySelector('.display-4');
        if (headerTitle) {
            headerTitle.style.opacity = '0';
            headerTitle.style.animation = 'fadeIn 1.5s forwards';
        }
    });