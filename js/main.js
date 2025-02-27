
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
        
        currentAirQuality.innerHTML = `
                    <h3>Lokasi: ${cityData.city}, ${cityData.state}, ${cityData.country}</h3>
                    <div class="aqi-indicator ${aqiClass}">
                        AQI: ${pollution.aqius} - ${aqiText}
                    </div>
                    <div class="weather-icon" style="text-align: center; font-size: 3em; margin: 15px 0;">
                        ${getWeatherIcon(weather.ic)}
                        <div style="font-size: 0.4em; margin-top: 5px;">
                            ${getWeatherDescription(weather.ic)}
                        </div>
                    </div>
                    <div class="weather-grid">
                        <!-- <div class="weather-item">
                            <h4>PM2.5</h4>
                            <p>${pm25Conc} µg/m³</p>
                            <small>Partikel halus di bawah 2,5 mikron</small>
                        </div>
                        <div class="weather-item">
                            <h4>PM10</h4>
                            <p>${pm10Conc} µg/m³</p>
                            <small>Partikel kasar di bawah 10 mikron</small>
                        </div> -->
                        <div class="weather-item">
                            <h4>Suhu</h4>
                            <p>${weather.tp}&deg;C</p>
                        </div>
                        <div class="weather-item">
                            <h4>Kelembaban</h4>
                            <p>${weather.hu}%</p>
                        </div>
                        <div class="weather-item">
                            <h4>Tekanan Udara</h4>
                            <p>${weather.pr} hPa</p>
                        </div>
                        <div class="weather-item">
                            <h4>Kecepatan Angin</h4>
                            <p>${weather.ws} m/s</p>
                        </div>
                    </div>
                    <div class="pollutant-info">
                        <p>Polutan Utama: ${getPollutantName(pollution.mainus)}</p>
                    </div>
                    <div class="last-updated">
                        Terakhir diperbarui: ${new Date(pollution.ts).toLocaleString()}
                    </div>
                `;
    } else {
        currentAirQuality.innerHTML = '<p class="error">Data pengukuran tidak tersedia</p>';
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
        const map = L.map('map').setView(samarindaCenter, 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Buat konten popup yang lebih informatif dengan ikon cuaca
        const popupContent = `
                <div style="min-width: 200px;">
                    <h3 style="margin: 0 0 10px 0;">Kualitas Udara & Cuaca</h3>
                    <div style="margin-bottom: 8px;">
                        <strong>AQI:</strong> <span style="color: ${getAQIColor(currentAQI)};">${currentAQI}</span>
                    </div>
                    <div style="margin-bottom: 10px; text-align: center; font-size: 2em;">
                        ${getWeatherIcon(currentWeather.ic)}
                    </div>
                    <div style="margin-bottom: 10px; text-align: center;">
                        <strong>${getWeatherDescription(currentWeather.ic)}</strong>
                    </div>
                    <div style="margin-bottom: 5px;">
                        <strong>Suhu:</strong> ${currentWeather.tp}°C
                    </div>
                    <div style="margin-bottom: 5px;">
                        <strong>Kelembaban:</strong> ${currentWeather.hu}%
                    </div>
                    <div style="margin-bottom: 5px;">
                        <strong>Tekanan Udara:</strong> ${currentWeather.pr} hPa
                    </div>
                    <div>
                        <strong>Kecepatan Angin:</strong> ${currentWeather.ws} m/s
                    </div>
                </div>
            `;
        
        // Tambahkan marker dengan popup yang lebih informatif
        const marker = L.marker(samarindaCenter)
        .bindPopup(popupContent)
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
                    <h4 style="margin: 0 0 8px 0;">Kualitas Udara</h4>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #009966"></div>
                        <span>Baik (0-50)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #ffde33"></div>
                        <span>Sedang (51-100)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #ff9933"></div>
                        <span>Tidak Sehat untuk Kelompok Sensitif (101-150)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #cc0033"></div>
                        <span>Tidak Sehat (151-200)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #660099"></div>
                        <span>Sangat Tidak Sehat (>200)</span>
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
        getCurrentData();
        getHistoricalData();
    });