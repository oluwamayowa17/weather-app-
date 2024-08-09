const STATE = document.getElementById('search');
const BASE_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const displayCity = document.querySelector('#city')
let latitude;
let longitude;



document.addEventListener('DOMContentLoaded', getCurrentLocation);


async function fetchLocationData(state) {
  try {
    const response = await fetch(`${BASE_URL}?q=${state}&appid=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    latitude = parseFloat(data[0].lat)
    longitude = parseFloat(data[0].lon)
    getTimeAndDate(latitude, longitude)
    fetchWeatherData(latitude, longitude)
    fetchDailyWeatherData(latitude, longitude)
    // console.log(data);
    displayCity.textContent = `${data[0].name}, ${data[0].country} - `

    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

async function fetchWeatherData(lat, lon){
  try{
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    displayWeatherData(data);
    // console.log(data);
    displayCity.textContent += `${data.name}`

  }catch(error){
    console.error('Error fetching weather data:', error);
  }

}

async function fetchDailyWeatherData(lat, lon){
  try{
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=16&appid=${API_KEY}&units=metric`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    displayForcastWeather(data)
    // console.log(data);
  }catch(error){
    console.error('Error fetching daily weather data:', error);
  }
}


async function getTimeAndDate(lat, lon){
  try {
    const response = await fetch(`https://cors-anywhere.herokuapp.com/https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    // console.log(data);
    displayDateAndTime(data)
  }
  catch(errors){
    console.error('Error fetching time and date:', errors);
  }
}

function getCurrentLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(position=>{
      document.querySelector('.weather-container').style.display = 'block'
      document.querySelector('.loader-container').style.display = 'none'
        const latitude = parseFloat(position.coords.latitude)
        const longitude = parseFloat(position.coords.longitude)
        fetchWeatherData(latitude, longitude)
        getTimeAndDate(latitude, longitude)
        fetchDailyWeatherData(latitude, longitude)
        // console.log(position);
    }, error=>{
      document.querySelector('.weather-container').style.display = 'block'
      document.querySelector('.loader-container').style.display = 'none'
      console.log(error.message);
    })
  }else{
    console.error('Browser does not support geolocation');
  }
}

STATE.addEventListener('submit', displayLocationData);


function displayLocationData(event){
    event.preventDefault();
    const stateInput = document.getElementById('search-input');
    if(stateInput.value.length === 0){
      stateInput.classList.add('error-message')
    }else{
      fetchLocationData(stateInput.value)
      stateInput.classList.remove('error-message')
    }
    
    
}

function displayDateAndTime(data){
  const dateTime = document.querySelector('#date-time')
  let month;
  switch(data.month){
    case 0:
      month = 'January'
      break;
    case 1:
      month = 'February'
      break;
    case 2:
      month = 'March'
      break;
    case 3:
      month = 'April'
      break;
    case 4:
      month = 'May'
      break;
    case 5:
      month = 'June'
      break;
    case 6:
      month = 'July'
      break;
    case 7:
      month = 'August'
      break;
    case 8:
      month = 'September'
      break;
    case 9:
      month = 'October'
      break;
    case 10:
      month = 'November'
      break;
    case 11:
      month = 'December'
    }

  if(data.hour > 20){
    document.body.className = 'night-time'
  }
  const ampm = data.hour >= 12? 'PM' : 'AM';
 

  
  dateTime.textContent = `${data.dayOfWeek}, ${data.day} ${month}, ${data.year} | ${data.hour}:${data.minute.toString().padStart(2, '0') } ${ampm}`

}

function displayWeatherData(weatherData) {
  const tempertaure = document.querySelector('#temp')
  tempertaure.textContent = Math.round(weatherData.main.temp)
  document.querySelector('#condition').textContent = weatherData.weather[0].description
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`
  document.querySelector('#degrees').textContent = `${weatherData.main.feels_like}°`
  document.querySelector('#humidity').textContent = `${weatherData.main.humidity}%`
  document.querySelector('#wind-speed').textContent = `${weatherData.wind.speed} m/s`

}

function displayForcastWeather(weatherData) {
  document.querySelector('.carousel').style.display = 'block';
  const weather = weatherData.list;
  const weatherDisplay = document.querySelector('.carousel-inner');
  weatherDisplay.innerHTML = ''; // Clear existing slides

  const chunkSize = 4;
  for (let i = 0; i < weather.length; i += chunkSize) {
    const chunk = weather.slice(i, i + chunkSize);
    const weatherContainer = document.createElement('div');
    weatherContainer.classList.add('carousel-item');
    weatherContainer.dataset.bsInterval = "5000"
    if (i === 0) {
      weatherContainer.classList.add('active'); // Make the first slide active
    }
    
    const row = document.createElement('div');
    row.classList.add('row');

    chunk.forEach((data) => {
      row.innerHTML += `
        <div class="col-md-3 col-sm-3 col-3 text-center">
          <p class="text-mute">${converTime(data.dt)}</p>
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon"/>
          <h6>${Math.ceil(data.main.temp_max)}° - ${Math.floor(data.main.temp_min)}°</h6>
          <p class="text-mute" id="condition">${data.weather[0].description}</p>
        </div>
      `;
    });

    weatherContainer.appendChild(row);
    weatherDisplay.appendChild(weatherContainer);
  }
}


function converTime(timestamp){
  const date = new Date(timestamp * 1000);
  let day = date.getDay();
  switch(day){
    case 0:
      day = 'Sunday'
      break;
    case 1:
      day = 'Monday'
      break;
    case 2:
      day = 'Tuesday'
      break;
    case 3:
      day = 'Wednesday'
      break;
    case 4:
      day = 'Thursday'
      break;
    case 5:
      day = 'Friday'
      break;
    case 6:
      day = 'Saturday'

  }
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12? 'PM' : 'AM';
  hours %= 12;
  hours = hours? hours : 12;
  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0') } ${ampm}`;
  return (`${day} ${formattedTime}`) 
}




