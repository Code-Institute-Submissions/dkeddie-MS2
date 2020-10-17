// DESTINATION SEARCH

let currentLocation = "London";
let destination

console.log(destination)






// newFunction();

// Algolia Places Search: https://www.algolia.com/

function autoComplete() {
  // src = "https://cdn.jsdelivr.net/npm/places.js@1.19.0";
  var placesAutocomplete = places({
    appId: 'pl3QLZ5PGJOK',
    apiKey: '17ed7fe7c8a13ca6a53f86095b7cde31',
    container: document.querySelector('#destination')
  });
}

autoComplete();


function getDestination() {
  document.getElementById('destination').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      destination = document.getElementById('destination').value;
      console.log(destination)
    }
  })
};

getDestination()

// let destination = document.getElementById('destination').addEventListener('keydown', (e) => {
//   if (e.keyCode === 13) {
//     destination = document.getElementById('destination').value;
//   }
// })

// document.getElementById('locations').onsubmit = async (e) => {
//   e.preventDefault();

//   let response = await fetch('/article/formdata/post/user', {
//     method: 'POST',
//     body: new FormData(locations)
//   });

//   let result = await response.json();

//   alert(result.message);
// };

// let destination = await document.getElementById('destination').value;

// async function latestLocation() {
//   let destination = await document.getElementById('destination').value;
//   const dest = await document.getElementById('destination').addEventListener('keydown', (e) => {
//     if (e.keyCode === 13) {
//       console.log(destination);
//     }
//   })
// }


//   latestLocation()


// async function getDestination () {
//   const travelDest = await destination;
//   console.log (destination)
//   console.log(travelDest)
// }

// async function getLocation() {
//   const travelDest = await document.getElementById('destination').addEventListener('keydown', (e) => {
//     if (e.keyCode === 13) {
//       travelDest = document.getElementById('destination').value;
//       // return
//     }
//     // return;
//     // console.log(destination)

//   })
// }

// console.log(destination)

// getLocation();

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

function showMonth() {
  let m = 0;
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