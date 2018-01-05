function adjustTemp(value) {
  if (value == "fahrenheit") toFahrenheit();
  if (value == "celsius") toCelsius();
}

function toFahrenheit() {
  updateCurrentInfo(selectedJSON);
  if ($("#option1").is(":checked")) updateHourlyInfo(selectedJSON);
  else updateDailyInfo(selectedJSON);
}

function toCelsius() {
  let value;
  value = parseInt($(".temp").text());
  value = convertToCelsius(value);
  $(".temp").html(value + "°");
  value = parseInt(
    $(".apparentTemp")
      .text()
      .substring(10)
  );
  value = convertToCelsius(value);
  $(".apparentTemp").html("Feels like " + value + "°");
  for (let i = 1; i <= 7; i++) {
    value = parseInt($(".entry-" + i + " > div:nth-child(3) > h5").text());
    value = convertToCelsius(value);
    $(".entry-" + i + " > div:nth-child(3) > h5").html(value + "&nbsp");
    value = parseInt($(".entry-" + i + " > div:nth-child(3) > h6").text());
    value = convertToCelsius(value);
    $(".entry-" + i + " > div:nth-child(3) > h6").html(value);
  }
}

function convertToCelsius(temp) {
  return roundUp((temp - 32) * 5 / 9);
}

function openNav() {
  if ($(".nav").css("width") == $("body").css("width")) {
    $(".nav").css({ width: "0" });
    $(".attrib, .made").css({ width: "0" });
    return;
  }
  $(".nav").css({ width: "100%" });
  $(".attrib, .made").css({ width: "auto" });
}

function closeNav() {
  $("#settings").prop("checked", false);
  $(".nav").css({ width: "0" });
  $(".attrib, .made").css({ width: "0" });
}

function clickHourly() {
  updateCurrentInfo(selectedJSON);
  updateHourlyTimes(selectedJSON);
  updateHourlyInfo(selectedJSON);
  if ($(".custom-select option:selected").text() == "Celsius") toCelsius();
}

function clickDaily() {
  updateCurrentInfo(selectedJSON);
  updateDailyTimes(selectedJSON);
  updateDailyInfo(selectedJSON);
  if ($(".custom-select option:selected").text() == "Celsius") toCelsius();
}

function roundUp(float) {
  return Math.round(float + 0.5);
}

function reverseGeocode(lat, long) {
  $.getJSON(
    "https://api-handler.glitch.me/reverseGeoencode/" + lat + "/" + long,
    function(json) {
      updateCurrentLocation(json);
    }
  );
}

function updateCurrentInfo(json) {
  let date = new Date(json.currently.time * 1000);
  var currentDay = date.getDay();
  $(".date-wrapper > p:first-child").html(days[currentDay] + "&nbsp");
  let this_day = currentDay;
  for (let i = 0; i < 7; i++) {
    this_day += 1;
    if (this_day >= 7) this_day -= 7;
    $(".entry-" + (i + 1) + "> div:nth-child(2) > h4").html(days[this_day]);
  }
  $(".temp").html(Math.round(json.currently.temperature + 0.5) + "°");
  $(".apparentTemp").html(
    "Feels like " + roundUp(json.currently.apparentTemperature) + "°"
  );
  main_icon.set("main_icon", Skycons[dict[json.currently.icon]]);
  main_icon.play();
  $(".current-summary").html(json.currently.summary);
}

function updateCurrentLocation(json) {
  let index = json.results[0].address_components.length - 1;
  if (json.results[0].address_components[index].short_name == "US")
    $(".location").html(json.results[0].formatted_address.slice(0, -5));
  else {
    $(".location").html(
      json.results[0].address_components[0].short_name +
        ", " +
        json.results[0].address_components[index].long_name
    );
  }
}

function updateDailyTimes(json) {
  let date = new Date(json.currently.time * 1000);
  var currentDay = date.getDay();
  let this_day = currentDay;
  for (let i = 0; i < 7; i++) {
    this_day += 1;
    if (this_day >= 7) this_day -= 7;
    $(".entry-" + (i + 1) + "> div:nth-child(2) > h4").html(days[this_day]);
  }
}

function updateDailyInfo(json) {
  for (let i = 1; i <= 7; i++) {
    let currStatus = dict[json.daily.data[i].icon];
    icon.set("icon" + i, Skycons[currStatus]);
    let currSummary = json.daily.data[i].summary;
    $(".entry-" + i + " > div:first-child > h6").html(currSummary);
    let currHighTemp = roundUp(json.daily.data[i].temperatureHigh);
    let currLowTemp = roundUp(json.daily.data[i].temperatureLow);
    $(".entry-" + i + " > div:nth-child(3) > h5").html(currHighTemp + "&nbsp");
    $(".entry-" + i + " > div:nth-child(3) > h6").html(currLowTemp);
  }
}

// do!
function updateHourlyTimes(json) {
  let date = new Date(json.currently.time * 1000);
  var currentHour = date.getUTCHours() + json.offset;
  let this_hour = currentHour;
  let is_morning = true;
  if (this_hour > 12) {
    this_hour -= 12;
    is_morning = false;
  }
  if (this_hour == 0) this_hour += 12;
  $(".entry-1 > div:nth-child(2) > h4").html("Now");
  for (let i = 1; i < 7; i++) {
    this_hour += 1;
    if (this_hour == 12) is_morning = !is_morning;
    if (this_hour > 12) this_hour -= 12;
    let ending = "PM";
    if (is_morning) ending = "AM";
    $(".entry-" + (i + 1) + "> div:nth-child(2) > h4").html(
      this_hour + " " + ending
    );
  }
}

function updateHourlyInfo(json) {
  for (let i = 0; i < 7; i++) {
    let currStatus = dict[json.hourly.data[i].icon];
    if (currStatus.includes("NIGHT"))
      // TO DO
      icon.set("icon" + (i + 1), Skycons[currStatus]);
    else icon.set("icon" + (i + 1), Skycons[currStatus]);
    let currSummary = json.hourly.data[i].summary;
    $(".entry-" + (i + 1) + " > div:first-child > h6").html(currSummary);
    let currTemp = roundUp(json.hourly.data[i].temperature);
    let currAppTemp = roundUp(json.hourly.data[i].apparentTemperature);
    $(".entry-" + (i + 1) + " > div:nth-child(3) > h5").html(
      currTemp + "&nbsp"
    );
    $(".entry-" + (i + 1) + " > div:nth-child(3) > h6").html(currAppTemp);
  }
}

function initialize() {
  var input = document.getElementById("city-search");
  var autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.addListener("place_changed", function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }
    selectedLat = place.geometry.location.lat();
    selectedLong = place.geometry.location.lng();
    reverseGeocode(selectedLat, selectedLong);
    $.getJSON(
      "https://api-handler.glitch.me/forecast/" +
        selectedLat +
        "/" +
        selectedLong,
      function(json) {
        selectedJSON = json;
        updateCurrentInfo(json);
        if ($("#option1").is(":checked")) {
          updateHourlyTimes(json);
          updateHourlyInfo(json);
        } else {
          updateDailyInfo(json);
        }
      }
    );
  });
}

google.maps.event.addDomListener(window, "load", initialize);

var icon = new Skycons({ color: "#35C8AE" });
var nightIcon = new Skycons({ color: "#a7a3d8" });
nightIcon.play();
icon.set("icon1", Skycons.RAIN);
icon.set("icon2", Skycons.PARTLY_CLOUDY_DAY);
icon.set("icon3", Skycons.CLOUDY);
icon.set("icon4", Skycons.SLEET);
icon.set("icon5", Skycons.SNOW);
icon.set("icon6", Skycons.WIND);
icon.set("icon7", Skycons.FOG);
icon.play();

var main_icon = new Skycons({ color: "white" });
main_icon.set("main_icon", Skycons.CLEAR_DAY);
main_icon.play();

var days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

var dict = {
  "clear-day": "CLEAR_DAY",
  "clear-night": "CLEAR_NIGHT",
  "partly-cloudy-day": "PARTLY_CLOUDY_DAY",
  "partly-cloudy-night": "PARTLY_CLOUDY_NIGHT",
  cloudy: "CLOUDY",
  rain: "RAIN",
  sleet: "SLEET",
  snow: "SNOW",
  wind: "WIND",
  fog: "FOG"
};

var selectedLat; // Global Lat
var selectedLong; // Global Long
var selectedJSON;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    selectedLat = position.coords.latitude;
    selectedLong = position.coords.longitude;
    console.log(selectedLat + " " + selectedLong);
    reverseGeocode(selectedLat, selectedLong);
    $.getJSON(
      "https://api-handler.glitch.me/forecast/" +
        selectedLat +
        "/" +
        selectedLong,
      function(json) {
        selectedJSON = json;
        updateCurrentInfo(json);
        updateDailyInfo(json);
      }
    );
  });
} else {
  window.alert(
    "Geolocation is not supported! Please type your location in the settings."
  );
}

window.onload = function() {
  setTimeout(function() {
    $(".loader-container").css({ width: "0" });
    $(".loader-container > h6").css({ display: "none" });
    $(".loader").css({ display: "none" });
  }, 1000);
};