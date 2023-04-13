// DOM element references
const Method = document.querySelector("#search-method");
const searchInput = document.querySelector("#search");
const currentWeather = document.querySelector("#current");
const futureForecast = document.querySelector("#future");
const locationHistory = document.querySelector("#history");

// Global variables
const apiKey = "cd75b4a0d0029c44910811064e3c34ef";
let searchHistory = [];

// This function displays the current weather data fetched from OpenWeather api.
function renderCurrentWeather(city, weather) {
  const date = dayjs().format("M/D/YYYY");
  // Store response data from our fetch request in variables
  const tempF = weather.main.temp;
  const windMph = weather.wind.speed;
  const humidity = weather.main.humidity;
  const iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  const iconDescription = weather.weather[0].description || weather[0].main;

  // Create the card elements
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const heading = document.createElement("h2");
  const weatherIcon = document.createElement("img");
  const tempEl = document.createElement("p");
  const windEl = document.createElement("p");
  const humidityEl = document.createElement("p");

  // Add classes to the card element
  card.classList.add("card");
  cardBody.classList.add("card-body");
  heading.classList.add("h3", "card-title");
  weatherIcon.classList.add("weather-img");
  tempEl.classList.add("card-text");
  windEl.classList.add("card-text");
  humidityEl.classList.add("card-text");

  // Set text content for the card elements
  heading.textContent = `${city} (${date})`;
  weatherIcon.src = iconUrl;
  weatherIcon.alt = iconDescription;
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  
  // Append the card elements to the DOM
  heading.append(weatherIcon);
  cardBody.append(heading, tempEl, windEl, humidityEl);
  card.append(cardBody);
  currentWeather.innerHTML = "";
  currentWeather.append(card);
}

// Function to create a card for a single day of the 5-day forecast
function renderForecastCard(forecast) {
  // Store the response data in variables
  const iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  const iconDescription = forecast.weather[0].description;
  const tempF = forecast.main.temp;
  const humidity = forecast.main.humidity;
  const windMph = forecast.wind.speed;

  // Create the card elements
  const col = document.createElement("div");
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const cardTitle = document.createElement("h5");
  const weatherIcon = document.createElement("img");
  const tempEl = document.createElement("p");
  const windEl = document.createElement("p");
  const humidityEl = document.createElement("p");

  // Add classes to the card element
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
  
  // Append the card elements to the DOM
  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
  futureForecast.append(col);
}

// This function renders the 5-day forecast section
function renderForecast(dailyForecast) {
  // Gets the unix timestamps for the start and end of the 5-day forecast
  const startDt = dayjs().add(1, "day").startOf("day").unix();
  const endDt = dayjs().add(6, "day").startOf("day").unix();

  // Creates the heading for the forecast section
  const headingCol = document.createElement("div");
  headingCol.classList.add("col-12");
  const heading = document.createElement("h4");
  heading.textContent = "5-Day Forecast:";
  headingCol.append(heading);

  // Clears any existing forecast data and adds the heading
  futureForecast.innerHTML = "";
  futureForecast.append(headingCol);

  // Filters the forecast data to get only the data we need (at noon, for the next 5 days)
  const filteredData = dailyForecast.filter((data) => {
    return (
      data.dt >= startDt && data.dt < endDt && data.dt_txt.slice(11, 13) == "12"
    );
  });
  filteredData.forEach(renderForecastCard);
}
// This finction renders the current weather and 5-day forecast
function renderItems(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  renderForecast(data.list);
}

// This function fetches weather data for a given location
function fetchWeather(location) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=imperial&appid=${apiKey}`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => renderItems(location.name, data))
    .catch((err) => console.error(err));
}

// This function fetches the coordinates for a search query
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

// This function displays the search history list
function renderSearchHistory() {
  locationHistory.innerHTML = "";

  // Start at end of history array and count down to show the most recent search at the top.
  for (let i = searchHistory.length - 1; i >= 0; i--) {
    const btn = document.createElement("button");
    btn.classList.add("history-btn", "btn-history");

    // Allows access to city name when click handler is invoked
    btn.dataset.search = searchHistory[i];
    btn.textContent = searchHistory[i];
    locationHistory.append(btn);
  }
}

// Function to update history in local storage then updates displayed search history.
function appendToHistory(search) {
  // If the search term is already in the search history, do nothing
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

// Initialize the search history when the script is first loaded
initSearchHistory();

// Add event listeners to the search form and the search history list to handle form submissions and clicks on search history buttons
Method.addEventListener("submit", handleMethodSubmit);
locationHistory.addEventListener("click", handleSearchHistoryClick);
