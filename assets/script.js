// Define an array to hold the user's search history
let searchHistory = [];
let lastCitySearched = "";

// Define the API key and base URL
const apiKey = 'e935acd4ed4f714b2016f72ac7382ecf';
const baseUrl = 'https://api.openweathermap.org/data/2.5';

// Define a function to get the weather data for a city
const getCityWeather = async (city) => {
  try {
    // Make a request to the API
    const response = await fetch(`${baseUrl}/weather?q=${city}&appid=${apiKey}`);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error('Unable to retrieve weather data');
    }

    // Parse the response data
    const data = await response.json();

    // Display the weather data
    displayWeather(data);

    // Save the last city searched and search history
    lastCitySearched = data.name;
    saveSearchHistory(data.name);
  } catch (error) {
    alert(error.message);
  }
};

// Define a function to handle the city search form submit
const searchSubmitHandler = (event) => {
  // Prevent the page from refreshing
  event.preventDefault();

  // Get the value from the input element
  const cityName = document.querySelector('#cityname').value.trim();

  // Check if the search field has a value
  if (cityName) {
    // Pass the value to getCityWeather function
    getCityWeather(cityName);

    // Clear the search input
    document.querySelector('#cityname').value = '';
  } else {
    // If nothing was entered, alert the user
    alert('Please enter a city name');
  }
};

// Define a function to display the weather data
const displayWeather = (weatherData) => {
  // Format and display the values
  const mainCityName = document.querySelector('#main-city-name');
  mainCityName.textContent = `${weatherData.name} (${dayjs(weatherData.dt * 1000).format('MM/DD/YYYY')})`;
  const img = document.createElement('img');
  img.src = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;
  mainCityName.appendChild(img);
  document.querySelector('#main-city-temp').textContent = `Temperature: ${weatherData.main.temp.toFixed(1)}°F`;
  document.querySelector('#main-city-humid').textContent = `Humidity: ${weatherData.main.humidity}%`;
  document.querySelector('#main-city-wind').textContent = `Wind Speed: ${weatherData.wind.speed.toFixed(1)} mph`;

  // Use lat & lon to make the UV index API call
  fetch(`${baseUrl}/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      // Display the UV index value
      const uvBox = document.querySelector('#uv-box');
      uvBox.textContent = `UV Index: ${data.value}`;
      
      // Highlight the value using the EPA's UV Index Scale colors
      if (data.value >= 11) {
        uvBox.style.backgroundColor = '#6c49cb';
      } else if (data.value < 11 && data.value >= 8) {
        uvBox.style.backgroundColor = '#d90011';
      } else if (data.value < 8 && data.value >= 6) {
        uvBox.style.backgroundColor = '#f95901';
      } else if (data.value < 6 && data.value >= 3) {
        uvBox.style.backgroundColor = '#f7e401';
      } else {
        uvBox.style.backgroundColor = '#299501';
      }
    })
    .catch(error => {
      alert('Unable to retrieve UV index data');
    });

  // Five-day forecast API call
  fetch(`${baseUrl}/forecast?q=${weatherData.name}&appid=${apiKey}&units=imperial`)
    .then(response => response.json())
    .then(data => {
      // Clear any previous entries in the five-day forecast
      const fiveDay = document.querySelector('#five-day');
      fiveDay.innerHTML = '';

      // Get every 8th value (24 hours) in the returned array from the API call
      for (let i = 7; i <= data.list.length; i += 8) {
        // Insert data into the day forecast card template
        const fiveDayCard = `
          <div class="col-md-2 m-2 py-3 card text-white bg-primary">
            <div class="card-body p-1">
              <h5 class="card-title">${dayjs(data.list[i].dt * 1000).format('MM/DD/YYYY')}</h5>
              <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="rain">
              <p class="card-text">Temp: ${data.list[i].main.temp}</p>
              <p class="card-text">Humidity: ${data.list[i].main.humidity}</p>
            </div>
          </div>
        `;

        // Append the day to the five-day forecast
        fiveDay.insertAdjacentHTML('beforeend', fiveDayCard);
      }
    })
    .catch(error => {
      alert('Unable to retrieve five-day forecast data');
    });
};

// Define a function to save the city search history to local storage
const saveSearchHistory = (city) => {
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    const searchHistoryList = document.querySelector('#search-history');
    const link = document.createElement('a');
    link.href = '#';
    link.classList.add('list-group-item', 'list-group-item-action');
    link.id = city;
    link.textContent = city;
    searchHistoryList.appendChild(link);
  }

  // Save the search history array and last city searched to local storage
  localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
  localStorage.setItem('lastCitySearched', JSON.stringify(lastCitySearched));
};

// Define a function to load saved city search history from local storage
const loadSearchHistory = () => {
  searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory'));
  lastCitySearched = JSON.parse(localStorage.getItem('lastCitySearched'));

  // If nothing in local storage, create an empty search history array and an empty last city searched string
  if (!searchHistory) {
    searchHistory = [];
  }

  if (!lastCitySearched) {
    lastCitySearched = '';
  }

  // Clear any previous values from the search-history ul
  const searchHistoryList = document.querySelector('#search-history');
  searchHistoryList.innerHTML = '';

  // For loop that will run through all the cities found in the array
  for (let i = 0; i < searchHistory.length; i++) {
    // Add the city as a link, set its ID, and append it to the search-history ul
    $("#search-history").append(`<a href="#" class="list-group-item list-group-item-action" id="${searchHistory[i]}">${searchHistory[i]}</a>`);
  }
};

// Load search history from local storage
loadSearchHistory();

// start page with the last city searched if there is one
if (lastCitySearched != ""){
    getCityWeather(lastCitySearched);
}

// event handlers
$("#search-form").submit(searchSubmitHandler);
$("#search-history").on("click", function(event){
    // get the links id value
    let prevCity = $(event.target).closest("a").attr("id");
    // pass it's id value to the getCityWeather function
    getCityWeather(prevCity);
});
