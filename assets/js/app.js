// "JSHINT" ran at https://jshint.com/ to check for errors
// The following were excluded 
// jshint esversion: 6
// jshint esversion: 8
// jshint esversion: 10

// <------ GLOBAL VARIABLES - to be used across the page  ------>

// location / destination variables
let destination;
let origin;



// <----- ALGOLIA FIXES FOR SKYSCANNER INTERFACE ----->
// Some Algolia places return place names that do not function well with Skyscanner.  For example, rather than returning 'London', Algolia returns 'City of London', which Skyscanner does not recognise in the API return.  As such, as these interoperability issues become known, the below list can be updated to provide a fix and enable the Skyscanner API to return results and provide Flight Prices for the current location / destination.
// Rather than using the destination and origin variables (which was the original basis of the Skyscanner API before implementing this fix), the below function checks if the destination / origin is contained within the list of 'replacements, and pushes either the replacement locationname , or the Algolia location name if not in the list, to the new variable (destinationSky / originSky)

// locations returned from Algolia to be replaced
let replacements = {
  "City of London": "London",
  "United States of America": "United States",
  "People's Republic of China": "China"
};

// locations variables for use in Skyscanner function below
let destinationSky;
let originSky;

// Function to check location names, replacing with 'replacements' variable if applicable, and pushing variables to new variables for Skyscanner
function ssInputs() {
  for (i = 0; i < Object.keys(replacements).length - 1; i++) {
    if (destination.includes(Object.keys(replacements)[i])) {
      destinationSky = destination.replace(Object.keys(replacements)[i], Object.values(replacements)[i]);
      i++;
    } else {
      destinationSky = destination;
    }
  }
  for (i = 0; i < Object.keys(replacements).length - 1; i++) {
    if (origin.includes(Object.keys(replacements)[i])) {
      originSky = origin.replace(Object.keys(replacements)[i], Object.values(replacements)[i]);
      i++;
    } else {
      originSky = origin;
    }
  }
}


// <----- ALGOLIA AUTOCOMPLETE DROPDOWN ----->
// When inputting the current location and destination, autocomplete suggestions will be returned in a dropdown menu

// Algolia AutoComplete Places Search: https://www.algolia.com/

function currentPlace() {
  var placesAutocomplete = places({
    appId: 'pl3QLZ5PGJOK',
    apiKey: '17ed7fe7c8a13ca6a53f86095b7cde31',
    container: document.querySelector('#currentLocation'),
    templates: {
      value: function (suggestion) {
        return `${suggestion.name}, ${suggestion.country}`;
      }
    }
  }).configure({
    type: 'city',
    aroundLatLngViaIP: false,
  });
}
function destPlace() {
  var placesAutocomplete = places({
    appId: 'pl3QLZ5PGJOK',
    apiKey: '17ed7fe7c8a13ca6a53f86095b7cde31',
    container: document.querySelector('#destination'),
    templates: {
      value: function (suggestion) {

        return `${suggestion.name}, ${suggestion.country}`;
      }
    }
  }).configure({
    type: 'city',
    aroundLatLngViaIP: false,
  });
}
currentPlace();
destPlace();


// <----- GET CURRENT LOCATION ----->

// Ensures that cursor is active in the Search Field when the page loads
$('#currentLocation').focus();

// Updates the global variable for the current location and transitions the Current Location search to Destination Search Bar
function loadCL() {
  origin = $('#currentLocation').val();
  $('#localHeader').hide('slow');
  $('#destHeader').show('slow');
  $('#destination').focus();
}

// The above function will run by either clicking the 'tick' button or pressing Enter on the keyboard
$('.btnCL').click(loadCL);
$('#currentLocation').keyup(function (e) {
  if (e.keyCode === 13) {
    loadCL();
  }
});

// <----- GET DESTINATION ----->

// Updates the global variable for the destination, transitions the 'tick' button to refresh and starts the Page Loading Sequence
function getDestination() {
  destination = $('#destination').val();
  $('#month').show('slow');
  $('.btnDest').hide();
  $('#reset').toggle();
  runSequence();
}

// The above function will run by either clicking the 'tick' button or pressing Enter on the keyboard
$('.btnDest').click(getDestination);
$('#destination').keyup(function (e) {
  if (e.keyCode === 13) {
    getDestination();
  }
});


// <----- PAGE LOADING SEQUENCE ----->

// This functions sets a sequence for running the functions and loading the Tiles.  As some of the APIs deliver variables that are required by other APIs, the setTimout function gives enough time for the information to be returned for those functions so that they do not run synchronously and deliver Errors

function runSequence() {
  setTimeout(() => {
    ssInputs();
    getWeather();
    currentWeather();
  }, 200);
  setTimeout(() => {
    graphData();
  }, 400);
  setTimeout(() => {
    setMap();
  }, 800);
}


// <----- MONTH TILE ----->

// Creates an array of dates starting with the current month
// As the date function in Javascript returns a numberic value for the month, the 'months' array can be used to represent the date as a three letter abbreviation
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
  $('#currentYear').html(monthArray[m].getFullYear());
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
      $('#currentYear').html(monthArray[m].getFullYear());
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
      $('#currentYear').html(monthArray[m].getFullYear());
      $('#currentMonth').html(months[monthArray[m].getMonth()]);
    });
}
showMonth();

// <----- WEATHER / TEMPERATURE TILES ------>
// Includes Weather Chart Tile and Average Temperature Tiles
// This section utilises data fetched from the Meteostat API and displays it in the Weather Chart Tile and the Average Temperature Tile

// Global variables are utilised as they are used by different Tiles to display the data.  The empty variables are populated by the funciton getWeather()

let dLat;
let dLng;
// The following will be Arrays
let weatherData = [];
let weatherDataTemps = [];
let weatherDataMins = [];
let weatherDataMaxes = [];

// This first function fetches the data and populates the global variables to be utilised on the Tiles

async function getWeather() {

  try {

    // API request to Google Maps API to determine the longitude and latitude coordinates of the destination, which is needed by the Meteostat API to return weather data

    const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
    const key = '&key=AIzaSyBKd5I7u1oc_iX8wrBze-LNNmiHFPqdtCI';

    const response1 = await fetch(`${url}${destination}${key}`);
    const locationData = await response1.json();
    dLat = locationData.results[0].geometry.location.lat;
    dLng = locationData.results[0].geometry.location.lng;

    // API request to Meteostat API to get weather data to be used for the Tiles.  The global variables are updated with this data in an Array

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
    weatherDataMins = weatherData.map((months, index) => {
      return weatherData[index].tmin;
    });
    weatherDataMaxes = weatherData.map((months, index) => {
      return weatherData[index].tmax;
    });
    weatherDataPrcp = weatherData.map((months, index) => {
      return weatherData[index].prcp;
    });

    // Once the data has been fetched and the variables updated, the following function is activated to update the Tiles with the Data
    weatherUpdate();

  } catch (error) {
    // If there are any errors in returning the data, an error message is returned to the Average Temperature Tile, prompting users to try again.
    $('#aveTemp').show('slow');
    $('#aveTempAlign').html("<h2>No data retrieved. Try again.</h2>");
  }
}

// AVERAGE TEMPERATURE TILE
// The following function pushes the data retried from the getWeather function to the Average Temperature Tile for the month displayed in the Month Tile
function weatherUpdate() {
  // Step to determine the Month shown / selected on the Month Tile
  const mo = $('#currentMonth').html();
  const moInt = months.indexOf(mo);
  // Selectes the weather for the month selected from the Variables / Arrays and stores as a local variable
  const moTemp = parseInt(weatherData[moInt].tavg);
  const moTempMin = parseInt(weatherData[moInt].tmin);
  const moTempMax = parseInt(weatherData[moInt].tmax);
  // Select the relevant elements, inserts the data to the Average Temperature Tile and reveals the Tile
  $('#temp').html(`${moTemp}&degC`);
  $('#tempMin').html(`${moTempMin}&degC`);
  $('#tempMax').html(`${moTempMax}&degC`);
  $('#aveTemp').show('slow');
}

// Listener Event monitors the current month displayed on the Month Tile, which can be changed by selecting the forward / back buttons, and updates the Average Temperature Tile.  (Follows same methodology as preceding function)
$('#month').click(() => {
  const mo = $('#currentMonth').html();
  const moInt = months.indexOf(mo);
  const moTemp = parseInt(weatherData[moInt].tavg);
  const moTempMin = parseInt(weatherData[moInt].tmin);
  const moTempMax = parseInt(weatherData[moInt].tmax);
  $('#temp').html(`${moTemp}&degC`);
  $('#tempMin').html(`${moTempMin}&degC`);
  $('#tempMax').html(`${moTempMax}&degC`);
});

// WEATHER CHART TILE
// Function loads Chart.js and upload weather data from the Metestat API and the global variables populated above
async function graphData() {
  try {
    const stepTwo = await getWeather();
    var ctx = await document.getElementById('myChart').getContext('2d');
    var chart = await new Chart(ctx, {
      // Type of Chart
      type: 'line',

      // Datasets
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

      // Configuration options
      options: {
        maintainAspectRatio: 'false',
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            gridLines: 'false',
            scaleLabel: {
              padding: '20',
            }
          }],
          yAxes: [{
            id: 'degC',
            type: 'linear',
            gridLines: 'false',
            position: 'left',
            scaleLabel: {
              display: 'false',
              labelString: 'Temp (\xB0C)',
              fontColor: 'rgb(175, 0, 42)'
            },
          }, {
            id: 'mm',
            type: 'linear',
            gridLines: 'false',
            position: 'right',
            scaleLabel: {
              display: 'false',
              labelString: 'Rain (mm)',
              fontColor: 'rgb(0, 0, 204)'
            },
          }]
        }
      }
    });
    // Displays the Weather Chart Tile which the data loads
    $('#weatherChartContainer').show('slow');
  } catch {
    // If there is no Data for the Chart to display, the following steps implement to display a message asking the User to start the process again.
    $('#weatherChartContainer').show('slow');
    $('#weatherChartContainer').html("<h2>Weather Data has not loaded.  <br><br>Please reload the page and start again.</h2>");
    $('#weatherChartContainer > h2').css('margin', '60px 20px');
    // Hide Months Tile if no Weather Data loads, so only the Error messages appear
    $('#month').hide();
  }
}

// <-----TODAY'S TEMPERATURE ----->
// Fetches current weather data from Weatherapi.com for the Current Weather Tile

async function currentWeather() {
  const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=3061f2bda70e40c4a77180232201810&q=${destination}`);
  const weatherNowData = await response.json();
  // Select data to be used from query in Tile as local variables.  Converts temperatures to integers from strings.
  const weatherNowTemp = parseInt(weatherNowData.current.temp_c);
  const weatherNowFeels = parseInt(weatherNowData.current.feelslike_c);
  const weatherNowImage = weatherNowData.current.condition.icon;
  const weatherNowImageTxt = weatherNowData.current.condition.text;
  // Push the variables to Current Weather Tiles and reveals the Tile
  $('#weatherNowTemp').html(`${weatherNowTemp}&degC`);
  $('#weatherNowImage').attr('src', `${weatherNowImage}`);
  $('#weatherNowImage').attr('title', `${weatherNowImageTxt}`);
  $('#feelslike').html(`${weatherNowFeels}&degC`);
  $('#todayTemp').show("slow");
}

// <----- MAP TILE ----->
// Utilises Static Google Maps API to return a map image of the destination.  The API uses the longitude and latitude coordinates established for the Weather / Temperatures Tiles above.

function setMap() {
  // If the coordinates are defined, ie if the original function to fetch the coordinates has run and returned the coordinates, then the Static Google Maps API to return the map image will be fetched
  if (dLat != undefined && dLng != undefined) {
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${dLat},${dLng}&zoom=5&size=800x800&scale2&key=AIzaSyBKd5I7u1oc_iX8wrBze-LNNmiHFPqdtCI`;
    document.getElementById('mapBox').style.backgroundImage = `url("${url}")`;
    $('#mapBox').show('slow');
    // If map loads, then the following functions will also be loaded
    getFlightData();
    initialize();
  } else {
    // Error statement if the map image is not able to be retrieved
    alert("Error with loading your Destination.  Please refresh the page and try again, taking care to enter a recognised place in the Search Bar");
  }
}


// <----- FLIGHT COST TILE ----->
// Utilises Skyscanner API viz RapidAPI to provide the lowest flight price from the current location to the destination for the month currently shown / selected on the Month Tile.
// Use of RapidAPI.com to access Skyscanner API, as the direct Skyscanner API is for 'Partners'


async function getFlightData() {

  // Local variable set within function which will be used on the Flight Price Tile
  let lowestPrice = 0;
  console.log(originSky);
  console.log(destinationSky);

  // Two Skyscanner APIs required to return results.  First, to get airport names.  Then second to return the lowest price.
  try {
    // 1st API to get airport names.  Utilises the modified global origin and destination variables.
    // Get origin airport ID
    const originNameSearch = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=${originSky}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
      }
    });
    const originNameData = await originNameSearch.json();
    const originNameID = await originNameData.Places[0].CityId;
    // The returned value has to be modified for the next second API, removing the suffic '-sky'
    const originNameShort = await originNameID.split('-', 1)[0];

    // Get destination airport ID
    const destinationNameSearch = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=${destinationSky}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
      }
    });
    const destinationNameData = await destinationNameSearch.json();
    const destinationNameID = await destinationNameData.Places[0].CityId;
    const destinationNameShort = await destinationNameID.split('-', 1)[0];

    // 2nd API to return the lowest Flight Prices
    // Establishes local variables to be used in the API call
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
    lowestPrice = data.Quotes[0].MinPrice;


    // Send lowest flight price to HTML and Show Tile
    $('#flightPrice').html(`£${lowestPrice}`);
    $('#flightCostBox').show('slow');

    // Update Tile with link to Skyscanner with pre-inserted search info
    linkURL = `https://www.skyscanner.net/transport/flights/${originNameShort}/${destinationNameShort}/?adults=1&adultsv2=1&cabinclass=economy&children=0&childrenv2=&inboundaltsenabled=false&infants=0&iym=${yearNrShort}${monthNr}&outboundaltsenabled=false&oym=${yearNrShort}${monthNr}&preferdirects=false&preferflexible=false&ref=home&rtn=1&selectedoday=01&selectediday=01`;
    $('#noFlightPrice').hide('fast');
    $('a[href="https://www.skyscanner.net"]').attr('href', linkURL);

  } catch (error) {
    // If no flight prices returned, direct users to Skyscanner.net
    if (lowestPrice === 0) {
      $('#flightPrice').html('');
      $('#flightCostBox').show('slow');
      $('#noFlightPrice').show('fast');
    } else {
      $('#noFlightPrice').hide('fast');
      // Prevents both flight prices and fallback statement for no flight prices appearing on the tile concurrently
    }
  }
}

// Update to Price based on the month currently shown / selected.  
// Gets current month from month array, reloads function to update price dependent on current month active in the Month Tile

$('#month').click(function () {
  getFlightData();
});


// <----- PHOTO TILE ----->
// Utilises Google Places to deliver photos of the destination which is delivered via the Google Maps Javascript API.  

// The below was developed from here (http://answerbig.diary.to/archives/1038987625.html) and here (http://jsfiddle.net/dLxqx3n8/), as well as the Google Maps Platform documentation associated with Maps Javascript API

var map;
var photoResults = [];

function initialize() {
  mylatlng = new google.maps.LatLng(dLat, dLng);
  map = new google.maps.Map({});
  var request = {
    location: mylatlng,
    radius: 500,
    query: ['point of interest'],
  };

  var service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    showFirstPicture(results);
  }
}

// Function to push only the results with photos to a new array, and send the first result to the Photo Tile
function showFirstPicture(results) {
  for (k = 0; k < results.length; k++)
    if (results[k].photos != null) {
      photoResults.push(results[k].photos[0]);
      k++;
    }
  $('#imageBox').css('background-image', `url("${photoResults[photoResults.length - 1].getUrl({ 'maxWidth': 500, 'maxHeight': 500 })}")`);
  $('#imageBox').show('slow');
  

  // Implementation of automatic forward rotation of pictures once loaded by implementing a setInterval function
  let goRotate = setInterval(autoRotate, 2500)
  function autoRotate() {
    if (k >= 0 && k < photoResults.length - 1) {
    }
    else {
      k = 0;
    }

    $('#imageBox').css('background-image', `url("${photoResults[k++].getUrl({ 'maxWidth': 500, 'maxHeight': 500 })}")`)
  }

  // Clicking the manual forward/backward buttons stops the rotation/setInterval function
  $('#imageBack').click( () => {
    stopRotate();
  });
  $('#imageForward').click( () => {
    stopRotate();
  });
  function stopRotate() {
    clearInterval(goRotate)
  }
}

// Event listener cycles through the photoResults array when clicking back/forward
$('#imageForward').click(() => {
  if (k >= 0 && k < photoResults.length - 1) {
    k++;
  }
  else {
    k = 0;
  }
  $('#imageBox').css('background-image', `url("${photoResults[k].getUrl({ 'maxWidth': 500, 'maxHeight': 500 })}")`);
});

$('#imageBack').click(() => {
  if (k > 0 && k <= photoResults.length - 1) {
    k--;
  }
  else {
    k = photoResults.length - 1;
  }
  $('#imageBox').css('background-image', `url("${photoResults[k].getUrl({ 'maxWidth': 500, 'maxHeight': 500 })}")`);
});


// <----- RELOAD PAGE TO START AGAIN ----->

$('#reset').click(function () {
  location.reload();
});
