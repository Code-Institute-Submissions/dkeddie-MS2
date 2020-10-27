// DESTINATION SEARCH

// let currentLocation

// GLOBAL VARIABLES

// destination
let destination
let address
let origin

// current locations
let cLat;
let cLng;

let dLat
let dLng

// Algolia Places Search: https://www.algolia.com/
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
  })
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


// PAGE LOADING

document.getElementById('destination').addEventListener('keyup', function (e) {
  if (e.keyCode === 13) {
    setTimeout(() => {
      getData();
    }, 200);
    setTimeout(() => {
      getWeather();
      currentWeather();
    }, 400);
    setTimeout(() => {
      graphData();
      getFlightData();
      setMap();
    }, 600);
  }
});


// 1. GET CURRENT LOCATION / COORDINATES

function getCurrentLocation() {
  document.getElementById('currentLocation').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      origin = document.getElementById('currentLocation').value;
      console.log(origin)
      $('#localHeader').hide('slow')
      $('#destHeader').show('slow')
      $('#allTiles').show('slow')
    }
  })
}

getCurrentLocation()

// 2. DESTINATION

function getDestination() {
  document.getElementById('destination').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      destination = document.getElementById('destination').value;
      $('#month').show('slow')
    }
  });
};
getDestination()


// MONTH SELECTOR TILE

let currentDate = new Date();
let monthArray = [];
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let m;

for (i = 0; i < 12; i++) {
  monthArray.push(new Date(currentDate.setMonth(currentDate.getMonth([i]) + 1)))
  console.log(monthArray)
};

function showMonth() {
  m = 0;
  $('#fullDate').html(monthArray[0]);
  $('#currentMonth').html(months[monthArray[m].getMonth()]);
  $('#monthForward').click(
    function () {
      if (m <= 10) {
        m++
      }
      else {
        m = 0;
      };
      $('#fullDate').html(monthArray[m]);
      $('#currentMonth').html(months[monthArray[m].getMonth()]);
    });
  $('#monthBack').click(
    function () {
      if (m > 0) {
        m--
      }
      else {
        m = 11
      };
      $('#fullDate').html(monthArray[m]);
      $('#currentMonth').html(months[monthArray[m].getMonth()]);
    })
}

showMonth();

// WEATHER / TEMPERATURE

// Metostat API Fetch

const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const key = '&key=AIzaSyBKd5I7u1oc_iX8wrBze-LNNmiHFPqdtCI';

async function getData() {
  const response = await fetch(`${url}${destination}${key}`);
  const locationData = await response.json();
  dLat = locationData.results[0].geometry.location.lat
  dLng = locationData.results[0].geometry.location.lng
};

// Weather DATA Import


let weatherData = []
let weatherDataTemps = []

let urlWeather = 0

async function getWeather() {
  urlWeather = `https://api.meteostat.net/v2/point/climate?lat=${dLat}&lon=${dLng}`
  const response = await fetch(urlWeather, {
    method: 'GET',
    credentials: 'omit',
  })
  const data1 = await response.json()
  weatherData = data1.data
  weatherDataTemps = weatherData.map((months, index) => {
    return weatherData[index].tavg;
  });
  weatherDataPrcp = weatherData.map((months, index) => {
    return weatherData[index].prcp;
  });
  function weatherUpdate() {
    const mo = document.getElementById('currentMonth').innerHTML;
    const moInt = months.indexOf(mo);
    const moTemp = weatherData[moInt].tavg
    document.getElementById('temp').innerHTML = `${moTemp}&degC`;
    $('#aveTemp').show('slow')
  }
  weatherUpdate()
}

document.getElementById('month').addEventListener('click', () => {
  const mo = document.getElementById('currentMonth').innerHTML
  const moInt = months.indexOf(mo);
  const moTemp = weatherData[moInt].tavg
  document.getElementById('temp').innerHTML = `${moTemp}&degC`
})

// GRAPH TILE

async function graphData() {
  const stepTwo = await getWeather()
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
      // maintainAspectRatio: 'false',
      legend: {
        display: false
      },
      // layout: {
      //   padding: {
      //     left: 0,
      //     right: 0,
      //     top: 0,
      //     bottom: 0
      //   }
      // },
      scales: {
        xAxes: [{
          gridLines: 'false',
          // maintainAspectRatio: 'true'
        }],
        xAxes: [{
          // id: 'degC',
          // type: 'linear',
          // position: 'left',
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
  $('#weatherChart').show('slow')
}

// Today's Temp Tile - Weatherapi.com

async function currentWeather() {
  const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=3061f2bda70e40c4a77180232201810&q=${destination}`);
  const weatherNowData = await response.json();
  console.log(weatherNowData)
  const weatherNowTemp = weatherNowData.current.temp_c;
  const weatherNowImage = weatherNowData.current.condition.icon;
  console.log(weatherNowTemp)
  document.getElementById('weatherNowTemp').innerHTML = `${weatherNowTemp}&degC`
  document.getElementById('weatherNowImage').src = `${weatherNowImage}`
  $('#todayTemp').show("slow")
}


// Map Tile

function setMap() {
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${dLat},${dLng}&zoom=5&size=800x800&scale2&key=AIzaSyBKd5I7u1oc_iX8wrBze-LNNmiHFPqdtCI`;
  document.getElementById('mapBox').style.backgroundImage = `url("${url}")`;
  $('#mapBox').show('slow')
}

// FLIGHT COST TILE --------------------------------------------

// Get current month from month array
$('#month').click(function() {
  getFlightData()
})

// Initial load of Flight data on origin/destination load
async function getFlightData() {
  try {
    // Get origin airport ID
    const originNameSearch = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=${origin}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
      }
    })
    const originNameData = await originNameSearch.json()
    const originNameID = await originNameData.Places[0].CityId;
    const originNameShort = await originNameID.split('-', 1)[0];

    // Get destination airport ID
    const destinationNameSearch = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=${destination}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
      }
    })
    const destinationNameData = await destinationNameSearch.json()
    const destinationNameID = await destinationNameData.Places[0].CityId;
    const destinationNameShort = await destinationNameID.split('-', 1)[0];

    // Get Flight Prices

    let monthNr = ('0'+(new Date($('#fullDate').html()).getMonth() + 1)).slice(-2);
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
    })
    const data = await response.json()
    lowestPrice = data.Quotes[0].MinPrice


    // Send lowest flight price to HTML and Show Tile
    document.getElementById('flightPrice').innerHTML = `£${lowestPrice}`
    $('#flightCostBox').show('slow')

    // Update Tile with link to Skyscanner with pre-inserted search info
    $('a[href="https://www.skyscanner.net"]').attr('href', linkURL)
    linkURL = `https://www.skyscanner.net/transport/flights/${originNameShort}/${destinationNameShort}/?adults=1&adultsv2=1&cabinclass=economy&children=0&childrenv2=&inboundaltsenabled=false&infants=0&iym=${yearNrShort}${monthNr}&outboundaltsenabled=false&oym=${yearNrShort}${monthNr}&preferdirects=false&preferflexible=false&ref=home&rtn=1&selectedoday=01&selectediday=01`

  } catch (error) {
    // If no flight prices returned, direct users to Skyscanner.net
    $('#flightCostBox').show('slow')
    $('#noFlightPrice').show('fast')
  }

}

// Photo Tile

// The below was developed from here (http://answerbig.diary.to/archives/1038987625.html) and here (http://jsfiddle.net/dLxqx3n8/), as well as the Google Maps Platform documentation associated with Maps Javascript API

function getPhoto() {
  var map;

  function initialize() {
    var mylatlng = new google.maps.LatLng(dLat, dLng);
    map = new google.maps.Map({});
    var request = {
      location: mylatlng,
      radius: 500,
    };

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  }

  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      showFirstPicture(results);
      console.log(results[0]);
    }
  }

  google.maps.event.addDomListener(document.getElementById('destination'), 'keyup', (e) => {
    if (e.keyCode === 13) {
      setTimeout(() => {
        initialize();
      }, 1000);
    }
  })

  function showFirstPicture(results) {
    for (var i = 0; i < results.length; i++) {
      if (results[i].photos != null) {
        document.getElementById('imageBox').style.backgroundImage = `url("${results[i].photos[0].getUrl({ 'maxWidth': 500, 'maxHeight': 500 })}"`;
        $('#imageBox').show('slow')
        break;
      }
    }
  }
}

getPhoto()