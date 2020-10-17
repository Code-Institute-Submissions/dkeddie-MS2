// MONTH SELECTOR

let currentDate = new Date();
let monthArray = [];

for (i = 0; i < 12; i++) {
  monthArray.push(new Date(currentDate.setMonth(currentDate.getMonth([i]) + 1)))
};

console.log(monthArray);

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

