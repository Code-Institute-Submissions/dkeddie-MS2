// "jshint" ran to check for errors
// jshint esversion: 6
// jshint esversion: 8
// jshint esversion: 10

// GLOBAL VARIABLES - to be used across the page -------------------------->

// destination
let destination;
let address;
let origin;

// current locations
let dLat;
let dLng;

// Algolia AutoComplete Places Search: https://www.algolia.com/
function autoComplete() {
  var currentPlace = places({
    appId: 'pl3QLZ5PGJOK',
    apiKey: '17ed7fe7c8a13ca6a53f86095b7cde31',
    container: document.querySelector('#currentLocation'),
    templates: {
      value: function (suggestion) {
        return suggestion.name;
      }
    }
  }).configure({
    type: 'city',
    aroundLatLngViaIP: false,
  });
  var destPlace = places({
    appId: 'pl3QLZ5PGJOK',
    apiKey: '17ed7fe7c8a13ca6a53f86095b7cde31',
    container: document.querySelector('#destination'),
    templates: {
      value: function (suggestion) {
        return suggestion.name;
      }
    }
  }).configure({
    type: 'city',
    aroundLatLngViaIP: false,
  });
}
autoComplete();


// PAGE LOADING STEPS ---------------------------------------------->

// Initial
$('#currentLocation').focus();

// After origin / destination input
document.getElementById('destination').addEventListener('keyup', function (e) {
  if (e.keyCode === 13) {
    setTimeout(() => {
      getWeather();
      currentWeather();
    }, 300);
    setTimeout(() => {
      graphData();
      getFlightData();
    }, 600);
    setTimeout(() => {
      getPhoto();
      setMap();
    }, 800);
  }
});


// GET CURRENT LOCATION ------------------------------------->

function getCurrentLocation() {
  document.getElementById('currentLocation').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      origin = document.getElementById('currentLocation').value;
      $('#localHeader').hide('slow');
      $('#destHeader').show('slow');
      $('#allTiles').show('slow');
      $('#destination').focus();
    }
  });
}
getCurrentLocation();

// GET DESTINATION LOCATION / COORDINATES --------------------------->

function getDestination() {
  document.getElementById('destination').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      destination = document.getElementById('destination').value;
      $('#month').show('slow');
      $('#destination').blur();
    }
  });
}
getDestination();

// MONTH TILE -------------------------------------------------------->

// Steps to create an array of dates to start with the current month
let currentDate = new Date();
let monthArray = [];
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

for (i = 0; i < 12; i++) {
  monthArray.push(new Date(currentDate.setMonth(currentDate.getMonth([i]) + 1)));
}

// Function to display the current month (1st month in the monthArray) in the Month Tile and then to cycle through the months, which can then also used by other Tiles to change displayed data.
function showMonth() {
  let m = 0;
  $('#fullDate').html(monthArray[0]);
  $('#currentMonth').html(months[monthArray[m].getMonth()]);
  $('#monthForward').click(
    function () {
      if (m <= 10) {
        m++;
      }
      else {
        m = 0;
      }
      $('#fullDate').html(monthArray[m]);
      $('#currentMonth').html(months[monthArray[m].getMonth()]);
    });
  $('#monthBack').click(
    function () {
      if (m > 0) {
        m--;
      }
      else {
        m = 11;
      }
      $('#fullDate').html(monthArray[m]);
      $('#currentMonth').html(months[monthArray[m].getMonth()]);
    });
}
showMonth();

// WEATHER / TEMPERATURE TILES -------------------------------------------->

// Weather DATA Import - fetch from Meteostat API
// Global variables utilised as Data returned by API used by different functions

let weatherData = [];
let weatherDataTemps = [];

async function getWeather() {

  try {

    // Get Coordinates for weather

    const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
    const key = '&key=AIzaSyBKd5I7u1oc_iX8wrBze-LNNmiHFPqdtCI';

    const response1 = await fetch(`${url}${destination}${key}`);
    const locationData = await response1.json();
    dLat = locationData.results[0].geometry.location.lat;
    dLng = locationData.results[0].geometry.location.lng;

    // Get Weather Data

    const urlWeather = `https://api.meteostat.net/v2/point/climate?lat=${dLat}&lon=${dLng}`;


    const response2 = await fetch(urlWeather, {
      method: 'GET',
      credentials: 'omit',
    });
    const data1 = await response2.json();
    weatherData = data1.data;
    weatherDataTemps = weatherData.map((months, index) => {
      return weatherData[index].tavg;
    });
    console.log(weatherDataTemps);
    weatherDataPrcp = weatherData.map((months, index) => {
      return weatherData[index].prcp;
    });
    weatherUpdate();
  } catch (error) {
    $('#aveTemp').show('slow');
    $('#aveTempAlign').html("<h2>No data retrieved. Try again.</h2>");
  }
}

// Function to push weather to Average Temperature Tile
function weatherUpdate() {
  const mo = document.getElementById('currentMonth').innerHTML;
  const moInt = months.indexOf(mo);
  const moTemp = weatherData[moInt].tavg;
  document.getElementById('temp').innerHTML = `${moTemp}&degC`;
  $('#aveTemp').show('slow');
}

// Change Average Temp Tile to align with month selected
document.getElementById('month').addEventListener('click', () => {
  const mo = document.getElementById('currentMonth').innerHTML;
  const moInt = months.indexOf(mo);
  const moTemp = weatherData[moInt].tavg;
  document.getElementById('temp').innerHTML = `${moTemp}&degC`;
});

// Weather Chart Tile - load Chart.js and upload weather data the chart
async function graphData() {
  try {
    const stepTwo = await getWeather();
    console.log(weatherDataTemps);
    var ctx = await document.getElementById('myChart').getContext('2d');
    var chart = await new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
        labels: months,
        datasets: [{
          label: 'Temp',
          fill: 'false',
          borderColor: 'rgb(175, 0, 42)',
          data: weatherDataTemps,
          yAxisID: 'degC'
        }, {
          label: 'Rain',
          fill: 'false',
          borderColor: 'rgb(0, 0, 204)',
          data: weatherDataPrcp,
          yAxisID: 'mm'
        }]
      },

      // Configuration options go here
      options: {
        maintainAspectRatio: 'false',
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            gridLines: 'false',
            scaleLabel: {
              padding: '20'
            }
          }],
          yAxes: [{
            id: 'degC',
            type: 'linear',
            position: 'left',
            scaleLabel: {
              display: 'true',
              labelString: 'Temp (\xB0C)',
              fontColor: 'rgb(175, 0, 42)'
            },
          }, {
            id: 'mm',
            type: 'linear',
            position: 'right',
            scaleLabel: {
              display: 'true',
              labelString: 'Rain (mm)',
              fontColor: 'rgb(0, 0, 204)'
            },
          }]
        }
      }
    });
    $('#weatherChartContainer').show('slow');
  } catch {
    $('#weatherChartContainer').show('slow');
    $('#weatherChartContainer').html("<h2>Weather Data has not loaded.  Please try again to retrieve Weather Data for your chosen destination</h2>").css('margin-top', '40px');
  }
}

// TODAY'S TEMPERATURE TILE-------------------------------------------------------->

// Fetched from Weatherapi.com - also incorporates push of data to tile

async function currentWeather() {
  const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=3061f2bda70e40c4a77180232201810&q=${destination}`);
  const weatherNowData = await response.json();
  const weatherNowTemp = weatherNowData.current.temp_c;
  const weatherNowImage = weatherNowData.current.condition.icon;
  document.getElementById('weatherNowTemp').innerHTML = `${weatherNowTemp}&degC`;
  document.getElementById('weatherNowImage').src = `${weatherNowImage}`;
  $('#todayTemp').show("slow");
}

// MAP TILE

// Static Google Maps Tile - utilisation of coordinates stored in Globabl Variables

function setMap() {
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${dLat},${dLng}&zoom=5&size=800x800&scale2&key=AIzaSyBKd5I7u1oc_iX8wrBze-LNNmiHFPqdtCI`;
  document.getElementById('mapBox').style.backgroundImage = `url("${url}")`;
  $('#mapBox').show('slow');
}


// FLIGHT COST TILE -------------------------------------------->

// Initial load of Flight data on origin/destination load
// Use of RapidAPI.com to access Skyscanner API
// Utilisation of Global Variables for information required to retrieve data

async function getFlightData() {
  try {
    // Get origin airport ID
    const originNameSearch = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=${origin}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
      }
    });
    const originNameData = await originNameSearch.json();
    const originNameID = await originNameData.Places[0].CityId;
    console.log(originNameID);
    const originNameShort = await originNameID.split('-', 1)[0];

    // Get destination airport ID
    const destinationNameSearch = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=${destination}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
      }
    });
    const destinationNameData = await destinationNameSearch.json();
    const destinationNameID = await destinationNameData.Places[0].CityId;
    const destinationNameShort = await destinationNameID.split('-', 1)[0];

    // Get Flight Prices

    let monthNr = ('0' + (new Date($('#fullDate').html()).getMonth() + 1)).slice(-2);
    // Attr: Skyscanner month requires to be two digits e.g. 02 for Feb.  Resolved on Stackoverflow https://stackoverflow.com/questions/1267283/how-can-i-pad-a-value-with-leading-zeros
    let yearNr = new Date($('#fullDate').html()).getFullYear();
    let yearNrShort = yearNr.toString().slice(-2);
    let monthOut = `${yearNr}-${monthNr}`;
    let monthIn = `${yearNr}-${monthNr}`;

    const response = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsedates/v1.0/US/USD/en-US/${originNameID}/${destinationNameID}/${monthOut}?inboundpartialdate=${monthIn}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
      }
    });
    const data = await response.json();
    let lowestPrice = data.Quotes[0].MinPrice;
    console.log(lowestPrice);


    // Send lowest flight price to HTML and Show Tile
    document.getElementById('flightPrice').innerHTML = `£${lowestPrice}`;
    $('#flightCostBox').show('slow');

    // Update Tile with link to Skyscanner with pre-inserted search info
    linkURL = `https://www.skyscanner.net/transport/flights/${originNameShort}/${destinationNameShort}/?adults=1&adultsv2=1&cabinclass=economy&children=0&childrenv2=&inboundaltsenabled=false&infants=0&iym=${yearNrShort}${monthNr}&outboundaltsenabled=false&oym=${yearNrShort}${monthNr}&preferdirects=false&preferflexible=false&ref=home&rtn=1&selectedoday=01&selectediday=01`;
    $('a[href="https://www.skyscanner.net"]').attr('href', linkURL);

  } catch (error) {
    // If no flight prices returned, direct users to Skyscanner.net
    if (lowestPrice === 0) {
      $('#flightCostBox').show('slow');
      $('#noFlightPrice').show('fast');
    }
    else {
      $('#noFlightPrice').hide('fast');
      // Prevents both flight prices and fallback statement for no flight prices appearing on the tile concurrently
    }

  }
}

// Get current month from month array, reloads function to update price dependent on current month active in the Month Tile

$('#month').click(function () {
  getFlightData();
});


// PHOTO TILE -------------------------------------------------------->

// The below was developed from here (http://answerbig.diary.to/archives/1038987625.html) and here (http://jsfiddle.net/dLxqx3n8/), as well as the Google Maps Platform documentation associated with Maps Javascript API

function getPhoto() {
  var map;
  var rotateImages = [];
  console.log(dLat);

  function initialize() {
    mylatlng = new google.maps.LatLng(dLat, dLng);
    console.log(mylatlng);
    map = new google.maps.Map({});
    var request = {
      location: mylatlng,
      radius: 500,
      query: ['point of interest'],
    };
    console.log(request);

    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);
  }

  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      showFirstPicture(results);
      rotateImages = results;
      console.log(results);
    }
  }

  initialize();

  let i = 0;

  function showFirstPicture(results) {
    for (i = 0; i < results.length; i++) {
      if (results[i].photos != null) {
        $('#imageBox').css('background-image', `url("${results[i].photos[0].getUrl({ 'maxWidth': 500, 'maxHeight': 500 })}")`);
        $('#imageBox').show('slow');
        console.log(results);
        break;
      }
    }
  }

  // Rotate photos with forward/back buttons
  $('#imageForward').click(() => {
    if (i <= 9) {
      i++;
    }
    else {
      i = 0;
    }
    $('#imageBox').css('background-image', `url("${rotateImages[i].photos[0].getUrl({ 'maxWidth': 500, 'maxHeight': 500 })}")`);
  });

  $('#imageBack').click(() => {
    if (i > 0) {
      i--;
    }
    else {
      i = 10;
    }
    $('#imageBox').css('background-image', `url("${rotateImages[i].photos[0].getUrl({ 'maxWidth': 500, 'maxHeight': 500 })}")`);
  });
}

// RELOAD PAGE TO START AGAIN ------------------------------------>

$('#reset').click(function () {
  location.reload();
});

