//Command line weather app

var https = require("https");
var http = require("http");



// My forecast.io API key 1d441640775895b7145f3c5342695407, 1000 per day.
// Weather forecast format: https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE

// My Google Maps API key AIzaSyCXAuUyG5eEwlioZFUz2nn5rA1gp4fsrHU, 2500 per day.
// Geocoding API request format: https://maps.googleapis.com/maps/api/geocode/output?parameters
// output: JSON or XML
// parameters: important ones are key and address, separate with &

//Read/store command line argument(s) 
var zipCode = process.argv.slice(2);

//changed when merged into 1 doc, prev was profiles.get, plan now is for only 1 zip at a time
//zipCode.forEach(get);

getLatLng(zipCode);

function getLatLng(zipCode){
  var GOOGLE_API_KEY = "AIzaSyCXAuUyG5eEwlioZFUz2nn5rA1gp4fsrHU";
  var requestLatLng = https.get("https://maps.googleapis.com/maps/api/geocode/json?key=" + GOOGLE_API_KEY + "&address=" + zipCode, function(response){
    var body = "";

    response.on("data", function(chunk) {
      body += chunk;
    });

    response.on("end", function(){
      if(response.statusCode === 200) {
        try {
          var parsedJSON = JSON.parse(body);
          getWeather(parsedJSON.results[0].geometry.location.lat, parsedJSON.results[0].geometry.location.lng, parsedJSON.results[0].formatted_address);
        } catch(error) {
          error.message2 = "Invalid Zip Code - ";
          printError(error);
        }
      } else {
        printError({message: "There was an error getting the lat/lng for zip code "+ zipCode + ". (" + http.STATUS_CODES[response.statusCode] + ")"});
      }
    });
  });
}

function getWeather(lat, lng, formattedAddress){
  var DARK_SKY_FORECAST_API_KEY = "1d441640775895b7145f3c5342695407";
  var requestWeather = https.get("https://api.forecast.io/forecast/" + DARK_SKY_FORECAST_API_KEY + "/" + lat + "," + lng, function(response){
    var body = "";

    response.on("data", function(chunk) {
      body += chunk;
    });

    response.on("end", function(){
      if(response.statusCode === 200) {
        try {
          var parsedJSON = JSON.parse(body);
          printMessage(formattedAddress, parsedJSON.currently.temperature, parsedJSON.currently.apparentTemperature, parsedJSON.daily.data[0].summary, parsedJSON.daily.data[1].temperatureMin, parsedJSON.daily.data[1].temperatureMax, parsedJSON.daily.data[1].summary);
        } catch(error) {
          error.message2 = "";
          printError(error);
        }
      } else {
        printError({message: "There was an error getting weather for zip code "+ zipCode + ". (" + http.STATUS_CODES[response.statusCode] + ")"});
      }
    });
  });
}

function printMessage(formattedAddress, curTemp, curFeelsLike, curSummary, fcastMinTemp, fcastMaxTemp, fcastSummary) {
  var message = "Weather for " + formattedAddress + ": " + "\n" + "Currently it is " + Math.round(curTemp,0) + "ºF (feels like " + Math.round(curFeelsLike,0) + "ºF) expect " + curSummary.toLowerCase() + "\n" + "Tomorrow, expect a low of " + Math.round(fcastMinTemp, 0) + "ºF and a high of " + Math.round(fcastMaxTemp, 0) + "ºF with " + fcastSummary.toLowerCase();
  console.log(message);
};

function printError(error){
  console.error(error.message2 + error.message);
};

//module.exports.get = get;