// DOM element references
const Method = document.querySelector("#search-method");
const searchInput = document.querySelector("#search");
const currentWeather = document.querySelector("#current");
const futureForecast = document.querySelector("#future");
const locationHistory = document.querySelector("#history");

// Global variables
const apiKey = "cd75b4a0d0029c44910811064e3c34ef";
let searchHistory = [];

// Function to display the current weather data fetched from OpenWeather api.
function renderCurrentWeather(city, weather) {
  const date = dayjs().format("M/D/YYYY");
  // Store response data from our fetch request in variables
  const tempF = weather.main.temp;
  const windMph = weather.wind.speed;
  const humidity = weather.main.humidity;
  const iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  const iconDescription = weather.weather[0].description || weather[0].main;

  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const heading = document.createElement("h2");
  const weatherIcon = document.createElement("img");
  const tempEl = document.createElement("p");
  const windEl = document.createElement("p");
  const humidityEl = document.createElement("p");

  card.classList.add("card");
  cardBody.classList.add("card-body");
  card.append(cardBody);

  heading.classList.add("h3", "card-title");
  tempEl.classList.add("card-text");
  windEl.classList.add("card-text");
  humidityEl.classList.add("card-text");

  heading.textContent = `${city} (${date})`;
  weatherIcon.src = iconUrl;
  weatherIcon.alt = iconDescription;
  weatherIcon.classList.add("weather-img");
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cardBody.append(heading, tempEl, windEl, humidityEl);

  currentWeather.innerHTML = "";
  currentWeather.append(card);
}

// Daily forecast
function renderForecastCard(forecast) {
  // variables for data from api
  const iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  const iconDescription = forecast.weather[0].description;
  const tempF = forecast.main.temp;
  const humidity = forecast.main.humidity;
  const windMph = forecast.wind.speed;

  // Create elements for a card
  const col = document.createElement("div");
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const cardTitle = document.createElement("h5");
  const weatherIcon = document.createElement("img");
  const tempEl = document.createElement("p");
  const windEl = document.createElement("p");
  const humidityEl = document.createElement("p");

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add("col-md", "five-day-card");
  card.classList.add("card", "bg-primary", "h-100", "text-white");
  cardBody.classList.add("card-body", "p-2");
  cardTitle.classList.add("card-title");
  tempEl.classList.add("card-text");
  windEl.classList.add("card-text");
  humidityEl.classList.add("card-text");

  // Add content to elements
  cardTitle.textContent = dayjs(forecast.dt_txt).format("M/D/YYYY");
  weatherIcon.setAttribute("src", iconUrl);
  weatherIcon.setAttribute("alt", iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  futureForecast.append(col);
}

// 5 day forecast
function renderForecast(dailyForecast) {
  // Get the unix timestamps for the start and end of the 5-day forecast
  const startDt = dayjs().add(1, "day").startOf("day").unix();
  const endDt = dayjs().add(6, "day").startOf("day").unix();

  // Create the heading for the forecast section
  const headingCol = document.createElement("div");
  headingCol.classList.add("col-12");
  const heading = document.createElement("h4");
  heading.textContent = "5-Day Forecast:";
  headingCol.append(heading);

  // Clear any existing forecast data and add the heading
  futureForecast.innerHTML = "";
  futureForecast.append(headingCol);

  // Filter the forecast data to get only the data we need (at noon, for the next 5 days)
  const filteredData = dailyForecast.filter((data) => {
    return (
      data.dt >= startDt && data.dt < endDt && data.dt_txt.slice(11, 13) == "12"
    );
  });
  filteredData.forEach(renderForecastCard);
}
// Function to render the current weather and 5-day forecast
function renderItems(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  renderForecast(data.list);
}

// Function to fetch the weather data for a given location
function fetchWeather(location) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=imperial&appid=${apiKey}`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => renderItems(location.name, data))
    .catch((err) => console.error(err));
}

// Function to fetch the coordinates for a search query
async function fetchCoords(search) {
  const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data[0]) {
        appendToHistory(search);
        fetchWeather(data[0]);
      } else {
        alert("Location not found");
      }
    })
    .catch((err) => console.error(err));
}

// Function to display the search history list.
function renderSearchHistory() {
  locationHistory.innerHTML = "";

  // Start at end of history array and count down to show the most recent at the top.
  for (let i = searchHistory.length - 1; i >= 0; i--) {
    const btn = document.createElement("button");
    btn.classList.add("history-btn", "btn-history");

    // `dataset.search` allows access to city name when click handler is invoked
    btn.dataset.search = searchHistory[i];
    btn.textContent = searchHistory[i];
    locationHistory.append(btn);
  }
}

// Function to update history in local storage then updates displayed history.
function appendToHistory(search) {
  // If there is no search term return the function
  if (searchHistory.includes(search)) {
    return;
  }
  searchHistory.push(search);

  localStorage.setItem("search-history", JSON.stringify(searchHistory));
  renderSearchHistory();
}

// Function to get search history from local storage
function initSearchHistory() {
  const storedHistory = localStorage.getItem("search-history");
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderSearchHistory();
}

// Function to handle the form submission for a search query
function handleMethodSubmit(event) {
  event.preventDefault();
  const search = searchInput.value.trim();
  if (search) {
    fetchCoords(search);
    searchInput.value = "";
  }
}

// Function to handle a click on a search history button
function handleSearchHistoryClick(event) {
  if (event.target.matches(".btn-history")) {
    const search = event.target.dataset.search;
    fetchCoords(search);
  }
}

// Initialize the search history
initSearchHistory();
Method.addEventListener("submit", handleMethodSubmit);
locationHistory.addEventListener("click", handleSearchHistoryClick);
