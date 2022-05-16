const weatherData_main = document.querySelector(".weatherData_main"),
inputPart = document.querySelector(".input-part"),
infoTxt = inputPart.querySelector(".info-txt"),
inputField = inputPart.querySelector("input"),
inputFieldbtn = inputPart.querySelector("#viewInfo_city")
locationBtn = inputPart.querySelector("#locateDevicebtn"),
weatherPart = weatherData_main.querySelector(".weather-part"),
wIcon = weatherPart.querySelector("img"),
chartCanvas = document.querySelector(".myChartCanvas");

let api;

//For Click event 
inputFieldbtn.addEventListener("click", () =>{ 
    // if user pressed enter btn and input value is not empty
     requestApi(inputField.value);	
});

//If user use keyboard enter after adding city name
inputField.addEventListener("keyup", e =>{
    // if user pressed enter btn and input value is not empty
    if(e.key == "Enter" && inputField.value != ""){
        requestApi(inputField.value);
    }
});

//to get the city related info using this function
function requestApi(city){
   let api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=693e06fd3aa5f68582b3e1467f3ce19d`;
	infoTxt.innerText = "Getting weather details...";
    infoTxt.classList.add("pending");
    fetch(api).then(res => res.json()).then(result => coOrdDetails(result)).catch(() =>{
        infoTxt.innerText = "Something went wrong";
        infoTxt.classList.replace("pending", "error");
    });
}

//to get Langitude and Latitude of the user when clicked on auto detect my location button
function coOrdDetails(info){
	if(info.cod == "404"){ // if user entered city name isn't valid
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    }else{
        //getting required properties value from the whole weather information

		const lati = info.coord.lat;
		const longi = info.coord.lon;
		displayWeatherInfo(lati, longi);
		fetchWeatherByLocation(lati, longi);		
	}
}

function displayWeatherInfo(latitude, longitude) {
	api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=693e06fd3aa5f68582b3e1467f3ce19d`;
	fetch(api).then(res => res.json()).then(result => weatherDetails(result)).catch(() =>{
        infoTxt.innerText = "Something went wrong";
        infoTxt.classList.replace("pending", "error");
    });
}

//Fetching the details to show the chart for 24hours forecast
function fetchWeatherByLocation(lati, longi) {	
	api =`https://api.openweathermap.org/data/2.5/onecall?lat=${lati}&lon=${longi}&appid=693e06fd3aa5f68582b3e1467f3ce19d`;
	fetch(api)
		  .then((data) => data.json()).then((loadedData) => {  
		
			let dts = loadedData.hourly.map((valuesData) => {	
				return valuesData.dt;
			})
			
			let dates = [];
			for(let i = 0; i<24; i++){
				dates[i] = new Date(dts[i+1]*1000).getHours().toLocaleString("en-US");
			}
			
			let temparatures = loadedData.hourly.map((valuesData) => {	
				return valuesData.temp/10;
			})
			
			let temps = [];
			for(let i = 0; i<24; i++){
				temps[i] = temparatures[i+1];
			}
			
			new Chart("hourlyDataCanvas", {
			  type: "line",
			  data: {
				labels: dates,
				datasets: [{
				  fill: false,
				  lineTension: 0,
				  backgroundColor: "#d39e00",
				  borderColor: "#4fb6ff",
				  tension: 0.1,
				  borderWidth: 4,
				  pointBorderWidth: 1,
				  data: temps
				}]
			  },
			  options: {
				legend: {display: false},
				scales: {
					yAxes: [{
					  scaleLabel: {
						display: true,
						labelString: 'Temparature',
						fontSize: 16,
					  }
					}],
					xAxes: [{
					  scaleLabel: {
						display: true,
						labelString: 'Hours',
						fontSize: 16,
					  }
					}]
				  }
				}
			});			
		  })
		  .catch((errorMessage) => {
			console.log(errorMessage);
		  });
}

//When user clicked on auto detect my location button
locationBtn.addEventListener("click", () =>{
    if(navigator.geolocation){ // if browser support geolocation api
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }else{
        alert("Your browser not support geolocation api");
    }
});

function onSuccess(position){
    const {latitude, longitude} = position.coords; // getting lat and lon of the user device from coords obj
	displayWeatherInfo(latitude, longitude)
	fetchWeatherByLocation(latitude, longitude);
}

function onError(error){
    // if any error occur while getting user location then we'll show it in infoText
    infoTxt.innerText = error.message;
    infoTxt.classList.add("error");
}

//to show all the details in html after fetching the data
function weatherDetails(info){
    if(info.cod == "404"){ // if user entered city name isn't valid
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    }else{
        //getting required properties value from the whole weather information
        const city = info.name;
		const country = info.sys.country;
        const {description, id} = info.weather[0];
        const {temp, feels_like, humidity} = info.main;
		const currTs = new Date(info.dt*1000).toLocaleString("en-US",  {hour12: false});

        if(id == 800){
            wIcon.src = "images/clear.svg";
        }else if(id >= 200 && id <= 232){
            wIcon.src = "images/storm.svg";  
        }else if(id >= 600 && id <= 622){
            wIcon.src = "images/snow.svg";
        }else if(id >= 701 && id <= 781){
            wIcon.src = "images/haze.svg";
        }else if(id >= 801 && id <= 804){
            wIcon.src = "images/cloud.svg";
        }else if((id >= 500 && id <= 531) || (id >= 300 && id <= 321)){
            wIcon.src = "images/rain.svg";
        }
		
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
        weatherPart.querySelector(".weather").innerText = description;
        weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
        weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
        weatherPart.querySelector(".timestamp span").innerText = `${currTs}`;		
        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        inputField.value = "";
        weatherData_main.classList.add("active");
		chartCanvas.classList.add("visible_canvas");	
    }
}
