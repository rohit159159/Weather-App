
/********************************** */

const apiKey = 'WCCN8CB2SMUS9MWA4ASKJUBRB';
let isCelsius = true;

async function getWeather() {
    const locationInput = document.getElementById('searchInput');
    const location = locationInput.value.trim() || 'India';
    const unitGroup = isCelsius ? 'metric' : 'us';
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${unitGroup}&key=${apiKey}&contentType=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        updateWeatherNow(data);
        updateHighlights(data);
        updateForecast(data);
        updateHourlyForecast(data); 
    } catch (error) {
        console.error('Error:', error);
        alert('Could not fetch weather data.');
    }
}
function updateWeatherNow(data) {
    const current = data.currentConditions;

    document.getElementById('cityName').innerText = data.resolvedAddress;

    document.getElementById('currentTemp').innerHTML = `${Math.round(current.temp)}°${isCelsius ? 'C' : 'F'}`;

    document.getElementById('feelsLike').innerHTML = `
        <img src="https://cdn-icons-png.flaticon.com/512/4151/4151022.png" alt="Thermometer" class="feel-icon">
        Feels like ${Math.round(current.feelslike)}°
    `;

    document.getElementById('highLow').innerText = `High: ${Math.round(data.days[0].tempmax)}°  Low: ${Math.round(data.days[0].tempmin)}°`;
    document.getElementById('weatherIcon').src = getWeatherIcon(current.conditions);
}

 function updateHighlights(data) {
    const current = data.currentConditions;
    const today = data.days[0];
    document.getElementById('uvIndex').innerText = `${current.uvindex ?? '--'}/10`;
    document.getElementById('windStatus').innerText = `${current.windspeed ?? '--'} ${isCelsius ? 'km/h' : 'mph'}`;
    document.getElementById('humidity').innerText = `${current.humidity ?? '--'}%`;
    document.getElementById('chanceRain').innerText = `${today.precipprob ?? '--'}%`;


    document.getElementById('sunrise').innerText = today.sunrise;
    document.getElementById('sunset').innerText = today.sunset;

    const sunriseTime = convertToLocalTime(today.sunrise);
    const sunsetTime = convertToLocalTime(today.sunset);

    if (sunriseTime && sunsetTime) {
        const durationMs = sunsetTime - sunriseTime;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('dayLength').innerText = `${hours} hr ${minutes} min`;
    } else {
        document.getElementById('dayLength').innerText = '--';
    }
}
function convertToLocalTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));

    if (isNaN(hours) || isNaN(minutes)) {
        console.error("Invalid time:", timeString);
        return null;
    }

    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
}

function updateForecast(data) {
    const combinedEl = document.getElementById('forecastCombined');
    combinedEl.innerHTML = ''; // Clear previous forecast data

    // Add 14-Day Forecast
    data.days.slice(0, 14).forEach(day => {
        const date = new Date(day.datetime);
        const dayCard = document.createElement('div');
        dayCard.className = 'forecast-card';
        dayCard.innerHTML = `
            <p>${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            <img src="${getWeatherIcon(day.conditions)}" alt="icon">
            <p>H:${Math.round(day.tempmax)}° / L:${Math.round(day.tempmin)}°</p>
            <div class="wind-info"> Wind
               
                <p>${day.windspeed} ${isCelsius ? 'km/h' : 'mph'}</p>
            </div>
        `;
        combinedEl.appendChild(dayCard);
    });
}
     //24-hours forcast
     function updateHourlyForecast(data) {
        const hourlyDiv = document.getElementById('hourlyForecast');
        hourlyDiv.innerHTML = '';
    
        const todayDate = new Date(data.days[0].datetime); // Get today's date
        const todayHours = data.days[0].hours.slice(0, 24);
    
        todayHours.forEach(hour => {
            const [h, m, s] = hour.datetime.split(':'); // Get hour, minute, second
            const date = new Date(todayDate); // Clone today's date
            date.setHours(parseInt(h), parseInt(m), parseInt(s));
    
            const hourTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const icon = getWeatherIcon(hour.conditions);
            const temp = Math.round(hour.temp);
    
            const card = document.createElement('div');
            card.className = 'hourly-card';
            card.innerHTML = `
                <p>${hourTime}</p>
                <img src="${icon}" alt="weather">
                <p>${temp}°${isCelsius ? 'C' : 'F'}</p>
            `;
            hourlyDiv.appendChild(card);
        });
    }
    
    
function toggleUnits() {
    isCelsius = !isCelsius;
    document.getElementById('toggleUnit').innerText = isCelsius ? '°C' : '°F';
    getWeather();
}
function getWeatherIcon(condition) {
    const normalized = condition.toLowerCase();
    if (normalized.includes('rain')) {
        return 'https://cdn-icons-png.flaticon.com/512/414/414974.png'; // Umbrella (Rain)
    } else if (normalized.includes('cloud')) {
        return 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png'; // Fresh Cloud
    } else if (normalized.includes('clear') || normalized.includes('sunny')) {
        return 'https://cdn-icons-png.flaticon.com/512/6974/6974833.png'; // Fresh Sun with small clouds
    } else if (normalized.includes('snow')) {
        return 'https://cdn-icons-png.flaticon.com/512/414/414968.png'; // Snowflake
    } else {
        return 'https://cdn-icons-png.flaticon.com/512/1163/1163620.png'; // Default Cloud
    }
}


const menuToggle = document.getElementById('menuToggle');
const navbarLinks = document.getElementById('navbarLinks');

menuToggle.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
});

// Function to update circle and number dynamically
function updateCircle(circleId, numberId, value, maxValue = 100) {
    const circle = document.getElementById(circleId);
    const number = document.getElementById(numberId);
    
    // Calculate stroke-dashoffset
    const radius = 0;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / maxValue) * circumference;

    circle.style.strokeDashoffset = offset;
    number.textContent = value + (numberId.includes("Index") ? "" : "%"); // Add % for non-UV
}

// Example: Update with dummy data
updateCircle('rainCircle', 'chanceRain', 70);   // 70% rain chance
updateCircle('uvCircle', 'uvIndex', 5, 10);     // UV index 5/10
updateCircle('windCircle', 'windStatus', 30, 100); // 30/100 wind
updateCircle('humidityCircle', 'humidity', 65); // 65% humidity



document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});
/***login.html***/
// Merge both event listeners into one
document.querySelectorAll('#loginBtn, #signupBtn').forEach(button => {
    button.addEventListener('click', function () {
        window.location.href = 'login.html'; // Redirect to login page
    });
});

document.getElementById('location-icon').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Fetch city name from reverse geocoding API
                const cityName = await getCityNameFromCoordinates(latitude, longitude);
                document.getElementById('searchInput').value = cityName; // Update input with city name
                getWeather(cityName);  // Fetch weather based on city name
            } catch (error) {
                console.error('Error fetching city name:', error);
                alert('Could not get weather from your location.');
            }
        }, () => {
            alert('Permission denied or location unavailable.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});
async function getCityNameFromCoordinates(latitude, longitude) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=d9e189aa43cc4121bb62e1d76c516c8c`;  // Replace with your OpenCage API key

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch city name');
        
        const data = await response.json();
        const city = data.results[0]?.components.city || data.results[0]?.components.town || 'City not found';  // Extract city from response
        
        // Check if the city is found
        if (city === 'City not found') {
            console.error('City not found from geocoder API');
            return 'Unknown City';  // Default if city is not found
        }
        
        return city;  // Return the city name
    } catch (error) {
        console.error('Error fetching city name:', error);
        return 'Error fetching city name';
    }
}
window.onload = getWeather;

/******************************************8 */

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');

// Add user message to chat
function addUserMessage(message) {
  const userMsg = document.createElement('div');
  userMsg.className = 'user-message';
  userMsg.textContent = message;
  chatBox.appendChild(userMsg);
}

// Add bot message to chat
function addBotMessage(message) {
  const botMsg = document.createElement('div');
  botMsg.className = 'bot-message';
  botMsg.textContent = message;
  chatBox.appendChild(botMsg);
  scrollChat();
}

// Scroll chat to bottom
function scrollChat() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Renamed to prevent conflict with main getWeather()
async function getWeatherForChat(city) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&contentType=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch weather");

    const data = await res.json();
    const current = data.currentConditions;
    const icon = getWeatherIcon(current.conditions);

    const response = `🌤️ Weather in ${data.resolvedAddress}: ${current.conditions} (${Math.round(current.temp)}°C, feels like ${Math.round(current.feelslike)}°C).`;

    addBotMessage(response);
    speak(response);
  } catch (err) {
    console.error(err);
    addBotMessage("❌ Sorry, I couldn't fetch the weather. Try another city.");
    speak("Sorry, I couldn't fetch the weather.");
  }
}

// Handle input
function handleInput(message) {
  if (!message.trim()) return;
  addUserMessage(message);
  getWeatherForChat(message.trim());
  userInput.value = '';
  scrollChat();
}

// Text input
sendBtn.addEventListener('click', () => {
  handleInput(userInput.value);
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleInput(userInput.value);
});

// Voice recognition
micBtn.addEventListener('click', () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    handleInput(transcript);
  };

  recognition.onerror = function () {
    addBotMessage("❌ Voice recognition failed.");
    speak("Voice recognition failed.");
  };
});

// Text-to-speech
function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

const launcher = document.getElementById('chatbotLauncher');
const chatbotWrapper = document.getElementById('chatbotWrapper');

launcher.addEventListener('click', () => {
  chatbotWrapper.classList.toggle('hidden');
});

  window.addEventListener("load", () => {
    setTimeout(() => {
      const loader = document.getElementById("loader");
      loader.style.opacity = 0;
      setTimeout(() => {
        loader.style.display = "none";
        document.getElementById("mainContent").style.display = "block";
      }, 1000); // Wait for fade-out
    }, 3000); // 3 seconds loading
  });

/////////////////////////////////////////////////
