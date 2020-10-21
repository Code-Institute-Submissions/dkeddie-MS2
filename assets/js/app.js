// DESTINATION SEARCH

// let currentLocation
let destination
let address
let origin

// Algolia Places Search: https://www.algolia.com/
function autoComplete() {
  var placesAutocomplete = places({
    appId: 'pl3QLZ5PGJOK',
    apiKey: '17ed7fe7c8a13ca6a53f86095b7cde31',
    container: document.querySelector('#destination')
  });
}
autoComplete();

// Get Current Location / Coordinates

let cLat;
let cLng;

if ('geolocation' in navigator) {
  console.log('gelocation available');
  navigator.geolocation.getCurrentPosition(position => {
    cLat = position.coords.latitude;
    cLng = position.coords.longitude;
    console.log(cLat);
    console.log(cLng);
  });
}
else {
  console.log('gelocation not available')
}

// Load Current Location and Destination to variables
function getDestination() {
  // Destination
  document.getElementById('destination').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      destination = document.getElementById('destination').value;
      console.log(destination)
      getData()
      setTimeout(() => {
        getWeather();
        currentWeather();
        console.log[m]
      }, 200);
      setTimeout(() => {
        graphData();
        getFlightData();
        setMap();
      }, 400);
    }
  });
  // Current Location
  setTimeout(async () => {
    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${cLat},${cLng}&key=AIzaSyBKd5I7u1oc_iX8wrBze-LNNmiHFPqdtCI`);
    let location = await response.json();
    console.log(location)
    address = location.results[6].formatted_address
    console.log(address)
    origin = location.results[9].address_components[0].long_name
  }, 300);
};
getDestination()

setTimeout(() => {
  console.log(destination)
}, 200);

// MONTH SELECTOR TILE

let currentDate = new Date();
let monthArray = [];

for (i = 0; i < 12; i++) {
  monthArray.push(new Date(currentDate.setMonth(currentDate.getMonth([i]) + 1)))
};

console.log(monthArray);

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function newFunction() {
  autoComplete();
}


let m;
function showMonth() {
  m = 0;
  document.getElementById("currentMonth").innerHTML = months[monthArray[m].getMonth()];
  document.getElementById("monthForward").addEventListener('click', function () {
    if (m <= 10) {
      m++
    }
    else {
      m = 0;
    }
    document.getElementById("currentMonth").innerHTML = months[monthArray[m].getMonth()];
  });
  document.getElementById("monthBack").addEventListener('click', function () {
    if (m > 0) {
      m--
    }
    else {
      m = 11
    }
    document.getElementById("currentMonth").innerHTML = months[monthArray[m].getMonth()];
  })
}

showMonth();

// Metostat API Fetch

const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const key = '&key=AIzaSyBKd5I7u1oc_iX8wrBze-LNNmiHFPqdtCI';


let dLat
let dLng
// let address = 0
// let place = 0

async function getData() {
  // address = await document.getElementById('City').value;
  // console.log(address)
  const response = await fetch(`${url}${destination}${key}`);
  console.log(`${url}${destination}${key}`)
  const locationData = await response.json();
  console.log(locationData)
  dLat = locationData.results[0].geometry.location.lat
  dLng = locationData.results[0].geometry.location.lng
  // place = locationData.results[0].formatted_address
  // console.log(place)
};

// setTimeout(() => {
//   getData()
//   console.log(`${url}${destination}${key}`)
// }, 1000);


// Weather DATA Import


let weatherData = []
let weatherDataTemps = []

let urlWeather = 0

async function getWeather() {
  // const coordinates = await getData
  urlWeather = `https://api.meteostat.net/v2/point/climate?lat=${dLat}&lon=${dLng}`
  console.log(urlWeather)
  const response = await fetch(urlWeather, {
    method: 'GET',
    credentials: 'omit',
    headers: {
      // 'Content-Type': 'application/json',
      // 'x-api-key': 'RMs9pME8PJQpNfti54tiw4fJQOquTm71',
    },
  })
  const data1 = await response.json()
  console.log(data1)
  weatherData = data1.data
  // weatherDataMonths = weatherData.map((months, index) => {
  //   return weatherData[index].month;
  // })
  weatherDataTemps = weatherData.map((months, index) => {
    return weatherData[index].tavg;
  });
  weatherDataPrcp = weatherData.map((months, index) => {
    return weatherData[index].prcp;
  });
  console.log(months)
  console.log(monthArray)
  console.log(weatherData)
  console.log(weatherDataTemps[m])
  function weatherUpdate() {
    const mo = document.getElementById('currentMonth').innerHTML;
    const moInt = months.indexOf(mo);
    const moTemp = weatherData[moInt].tavg
    console.log(mo)
    console.log(moInt)
    console.log(moTemp)
    document.getElementById('temp').innerHTML = `${moTemp}&degC`;
    console.log(m)
  }
  weatherUpdate()

  console.log(weatherDataTemps)
}

// setTimeout(() => {

// }, 250);

// };

document.getElementById('month').addEventListener('click', () => {
  const mo = document.getElementById('currentMonth').innerHTML
  const moInt = months.indexOf(mo);
  const moTemp = weatherData[moInt].tavg
  document.getElementById('temp').innerHTML = `${moTemp}&degC`
})

// GRAPH TILE

async function graphData() {
  // let lat = 0
  // let lng = 0
  // let weatherData = []
  // const stepOne = await getData()
  const stepTwo = await getWeather()
  console.log(weatherDataTemps)
  // console.log(weatherData[0].tavg)
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
}

// Today's Temp Tile - Weatherapi.com

async function currentWeather() {
  const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=3061f2bda70e40c4a77180232201810&q=${destination}`);
  const weatherNowData = await response.json();
  console.log(weatherNowData)
  const weatherNowTemp = weatherNowData.current.temp_c;
  const weatherNowCondition = weatherNowData.current.condition.text;
  const weatherNowImage = weatherNowData.current.condition.icon;
  console.log(weatherNowTemp)
  document.getElementById('weatherNowTemp').innerHTML = `${weatherNowTemp}&degC`
  document.getElementById('weatherNowImage').src = `${weatherNowImage}`
}


// Map Tile

function setMap() {
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${dLat},${dLng}&zoom=5&size=800x800&scale2&key=AIzaSyBKd5I7u1oc_iX8wrBze-LNNmiHFPqdtCI`
  document.getElementById('mapBox').style.backgroundImage=`url("${url}")`

}













// Flight Cost Tile


document.getElementById('month').addEventListener('click', () => {
  const mo = document.getElementById('currentMonth').innerHTML
  let moInt
  function confirmData() { 
    for (i = 0; i < monthArray.length; i++) {
          if (monthArray[i].toString().search(mo) > 0) {
            moInt = [i][0]
            console.log(moInt)
          }
        //   else {
        //     console.log("not success")
        // }
      }
    }
    confirmData()
  console.log(moInt)
  currentD = monthArray[moInt] 
  console.log(currentD)   
  nextD = new Date(currentD.setMonth(currentD.getMonth() + 1))
  console.log(nextD)
})

console.log(monthArray[0].toString().search('Nov'));


let currentD = new Date()

let yearNr = currentD.getFullYear();
let monthNr = currentD.getMonth()+1;
let monthOut = `${yearNr}-${monthNr}`
let monthIn = `${yearNr}-${monthNr}`
// let origin = address
// let destination = "Paris"

console.log(monthOut);



async function getFlightData() {
  console.log(address);
  // origin = "London"
  console.log(origin);
  const originNameSearch = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=${origin}`, {
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
    }
  })
  const originNameData = await originNameSearch.json()
  console.log(originNameData)
  const originNameID = originNameData.Places[0].CityId
  console.log(originNameID)
  console.log(origin)

  let destinationShort = destination.slice(0, destination.indexOf(","));
  console.log(destinationShort)

  const destinationNameSearch = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=${destinationShort}`, {
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
    }
  })
  const destinationNameData = await destinationNameSearch.json()
  console.log(destinationNameData)
  console.log(destination)
  const destinationNameID = destinationNameData.Places[0].CityId
  console.log(destinationNameID)


  const response = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsedates/v1.0/US/USD/en-US/${originNameID}/${destinationNameID}/${monthOut}?inboundpartialdate=${monthIn}`, {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
		"x-rapidapi-key": "79d622f787mshe349c803b0be374p11035ejsn2a0c241e87dd"
  }
  })
  const data = await response.json()
  console.log(data)
  lowestPrice = data.Quotes[0].MinPrice
  console.log(lowestPrice)
  document.getElementById('flightPrice').innerHTML = `£${lowestPrice}`
}

