const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeather = document.querySelector(".hourly-weather .weather-list");

const API_KEY = "f1dd6833dcff4da7bbb72607241812"; // API key

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("welcomeModal");
  const closeModal = document.getElementById("closeModal");

  // Show the modal when the app loads
  modal.style.display = "flex";

  // Close the modal when the button is clicked
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
});



// Weather codes for mapping to custom icons
const weatherCodes = {
  clear: [1000],
  clouds: [1003, 1006, 1009],
  mist: [1030, 1135, 1147],
  rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
  moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
  snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
  thunder: [1087, 1279, 1282],
  thunder_rain: [1273, 1276],
}

// Display the hourly forecast for the next 24 hours
const displayHourlyForecast = (hourlyData) => {
  const currentHour = new Date().setMinutes(0, 0, 0);
  const next24Hours = currentHour + 24 * 60 * 60 * 1000;

  // Filter the hourly data to only include the next 24 hours
  const next24HoursData = hourlyData.filter(({ time }) => {
    const forecastTime = new Date(time).getTime();
    return forecastTime >= currentHour && forecastTime <= next24Hours;
  });

  // Generate HTML for each hourly forecast and display it
  hourlyWeather.innerHTML = next24HoursData.map((item) => {
    const temperature = Math.floor(item.temp_c);
    const time = item.time.split(' ')[1].substring(0, 5);
    const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(item.condition.code));

    return `<li class="weather-item">
            <p class="time">${time}</p>
            <img src="icons/${weatherIcon}.svg" class="weather-icon">
            <p class="temperature">${temperature}°</p>
          </li>`;
  }).join('');
};

const showErrorModal = () => {
  const modal = document.getElementById("error-modal");
  modal.style.display = "flex";  // Show the modal
}

const closeModal = () => {
  const modal = document.getElementById("error-modal");
  modal.style.display = "none";  // Hide the modal
}

document.getElementById("close-modal").addEventListener("click", closeModal);

document.getElementById("restart-btn").addEventListener("click", () => {
  closeModal();
  // Optionally, reset search input or perform any other logic to restart
  searchInput.value = '';
});

// Fetch and display weather details
const getWeatherDetails = async (API_URL) => {
  window.innerWidth <= 768 && searchInput.blur();
  document.body.classList.remove("show-no-results");

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.error) {
      showErrorModal();  // Show modal if there's an error
      return;
    }

    // Get current temperature in Celsius and store it globally
    currentTempCelsius = data.current.temp_c;
    currentTempFahrenheit = (currentTempCelsius * 9) / 5 + 32; // Store the equivalent Fahrenheit value


    const temperature = Math.floor(currentTempCelsius);
    const description = data.current.condition.text;
    const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(data.current.condition.code));

    // Update weather display
    currentWeatherDiv.querySelector(".weather-icon").src = `icons/${weatherIcon}.svg`;
    currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature}<span>°C</span>`;
    currentWeatherDiv.querySelector(".description").innerText = description;

    const combinedHourlyData = [...data.forecast?.forecastday[0]?.hour, ...data.forecast?.forecastday[1]?.hour];
    searchInput.value = data.location.name;
    displayHourlyForecast(combinedHourlyData);
  } catch (error) {
    document.body.classList.add("show-no-results");
    showErrorModal();  // Show modal if there's a network error
  }
};

// Set up the weather request for a specific city
const setupWeatherRequest = (cityName) => {
  const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
  getWeatherDetails(API_URL);
};

let currentTempCelsius = null;  // Store the current temperature in Celsius globally
let currentTempFahrenheit = null;  // Store the current temperature in Fahrenheit
let isCelsius = true;  // Track the current unit

// Function to convert temperature
function convertTemperature() {
  const tempElement = document.querySelector(".temperature");

  if (isCelsius) {
    // Convert Celsius to Fahrenheit and store it
    currentTempFahrenheit = (currentTempCelsius * 9) / 5 + 32;
    tempElement.innerHTML = `${currentTempFahrenheit.toFixed(1)}<span>°F</span>`;  // Update displayed temp
    document.querySelector(".convert-button").textContent = "Convert to °C";  // Update button text
  } else {
    // Convert Fahrenheit to Celsius and store it
    currentTempCelsius = ((currentTempFahrenheit - 32) * 5) / 9;
    tempElement.innerHTML = `${currentTempCelsius.toFixed(1)}<span>°C</span>`;  // Update displayed temp
    document.querySelector(".convert-button").textContent = "Convert to °F";  // Update button text
  }

  isCelsius = !isCelsius;  // Toggle the state
}


// Handle user input in the search box
searchInput.addEventListener("keyup", (e) => {
  const cityName = searchInput.value.trim();

  if (e.key == "Enter" && cityName) {
    setupWeatherRequest(cityName);
  }
});

// Get user's coordinates and fetch weather data for the current location
locationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
      getWeatherDetails(API_URL);
      window.innerWidth >= 768 && searchInput.focus();
    },
    () => {
      alert("Location access denied. Please enable permissions to use this feature.");
    }
  );
});

// Initial weather request for London as the default city
setupWeatherRequest("London");