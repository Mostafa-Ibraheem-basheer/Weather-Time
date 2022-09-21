/***************************************CONST VARIABLES FOR FASTER ELEMENT ACCESS*************************************************/
const apiKey1 = '6fb5da87ff5fd1bc043f0f555e0d13a0&units=metric';//apikey for temp
const apiKey2 = '93cddcea9e6640a4b489c0bb9a78a545';//apikey for time and date
const menu = document.getElementById('location-menu'); //menu for countries
const locationBtn = document.querySelector('#location-btn');//change location anchor
const exitBtn = document.querySelector('.exit-btn');//the X anchor on the countries menu
const navbar = document.querySelector('.navbar');//navigation menu and title container
const main = document.querySelector('.main');// container for the all the data
const temp = document.querySelector('.temp'); // Temperature Data element
const time = document.querySelector('.time'); // Time and Date Data element
const background = document.querySelector('.mask'); // to change background color and animation
const week = ['Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.']; // used to in combination with getDay to find what day of the week we are in
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // get the time zone of the user
const userCity  =  userTimeZone.substring(userTimeZone.indexOf('/')+1); // use time zone to determine the city that the user is in to get it's date and time
/***************************************GLOBAL VARIABLES*************************************************/
let isFahrenheit = document.querySelector('#checkbox-temp').checked; // for unit conversion
let isMilitaryTime = document.querySelector('#checkbox-time').checked; //for format conversion
let cityName = ''; //used in the query proccess
let apiRequest1 = ' '; //the complete url of the temperature api goes here
let apiRequest2 = ''; //the complete url of the time api goes here
let data = {}; //to put the data form the api request
/******************************STYLING CODE**************************/
function showSettings(){//fires if the settings button is pressed
    document.getElementById("myDropdown").classList.toggle("show");
  }

window.onclick = function(e) { // Close the dropdown menu if the user clicks outside of it
    if (e.target.matches('main')) {
        document.getElementById("myDropdown").classList.remove('show');
    }
}

function exitMenu(){
    locationBtn.click() //if you press the X it does the same as if the location button has been pressed
}

function moveBtn(){ // Used to move the search-btn when the search bar extends or shrinks
  document.querySelector('.search-btn').classList.toggle('move-btn')
}


locationBtn.addEventListener('click', function () {// if the location button is pressed display the location menu

    if (menu.classList.contains('hide-menu')) {//Toggle between hiding and showing the menu when the button is pressed
        menu.classList.remove('hide-menu');
        setTimeout(function () {// we add the delay because without it the both the display and the opacity property will happen at the same time which would still look like it instantly displayed
        menu.classList.remove('visuallyhidden');
        }, 20);
    } else {
        menu.classList.add('visuallyhidden');    
        menu.addEventListener('transitionend', function(e) {
        menu.classList.add('hide-menu');
        }, {
        capture: false,
        once: true,
        passive: false
        });
    }
    navbar.classList.toggle('location-menu-active');//these 4 lines to blur the header and footer as well as hide the data to shift the focus on the location menu
    document.querySelector('.footer').classList.toggle('location-menu-active');
    temp.classList.toggle('hide-data');
    time.classList.toggle('hide-data');
}, false);

/* These 3 functions are used to change the background styling for the menu and page based on the time */
function daytime(){
  main.classList.add('daytime');
  main.classList.remove('sunset');
  main.classList.remove('night');

  menu.classList.add('daytime');
  menu.classList.remove('sunset');
  menu.classList.remove('night');

  background.classList.remove('stars');
  background.classList.add('clouds');
}
function sunset(){
  main.classList.remove('daytime');
  main.classList.add('sunset');
  main.classList.remove('night');

  menu.classList.remove('daytime');
  menu.classList.add('sunset');
  menu.classList.remove('night');

  background.classList.remove('stars');
  background.classList.add('clouds');
}
function night(){
  main.classList.remove('daytime');
  main.classList.remove('sunset');
  main.classList.add('night');

  menu.classList.remove('daytime');
  menu.classList.remove('sunset');
  menu.classList.add('night');

  background.classList.add('stars');
  background.classList.remove('clouds');
}


/*************************************CLIENT SIDE CODE************************************************/
window.addEventListener('load', function(e){ //to Automatically get the data for the user after the page loads
  cityName = userCity;
  apiRequest1 = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey1}`;
  apiRequest2 = `https://timezone.abstractapi.com/v1/current_time/?api_key=${apiKey2}&location=${cityName}`;
  getData(apiRequest1,apiRequest2)
  .then(function(){ // chain a POST route to save data from the api,user and the Date metohd request to the endpoint projectData array
    try{
      postData('/addData',{temp: data.main.temp , date: data.datetime , country: data.sys.country});
    }
    catch(error){
      console.log(error,'error');
    }
  })
  .then(function(){// chain the method to update the ui with our new data entry
    updateUi();
  });
});

setInterval(updateData, 10000);//update the data each 10 seconds
function updateData(){
  apiRequest1 = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey1}`;
  apiRequest2 = `https://timezone.abstractapi.com/v1/current_time/?api_key=${apiKey2}&location=${cityName}`;
  getData(apiRequest1,apiRequest2)
  .then(function(){ // chain a POST route to save data from the api to the endpoint
    try{
      postData('/addData',{temp: data.main.temp , date: data.datetime , country: data.sys.country});
    }
    catch(error){
      console.log(error,'error');
    }
  })
  .then(function(){// chain the method to update the ui with our new data entry
    updateUi();
  });
};

function changeTemp(){
  isFahrenheit = !isFahrenheit;
  updateUi();
}
function changeTime(){
  isMilitaryTime = !isMilitaryTime;
  updateUi();
}

async function postData(url = '', data = {}){ //this function takes our data and pushes it in the endpoint
    const response = await fetch(url, {
      method: 'POST', 
      credentials: 'same-origin',
      headers: {
          'Content-Type': 'application/json',
      },
     // Body data type must match "Content-Type" header        
      body: JSON.stringify(data), 
    });
}

async function getData(apiRequest1,apiRequest2){//make api request
    const response1 = await fetch(apiRequest1)
    const response2 = await fetch(apiRequest2)
    try {
  
      let tempData = await response1.json();
      let timeData = await response2.json();
      data = await Object.assign(tempData,timeData); //transform the data to json
    }  
    catch(error) {
      console.log("error", error);
    }
}

async function updateUi(){ //here we take all of our data from both the apis and update the corresponding elements
  const request = await fetch('/updateUi');
  
  try{
    /* Parse the Time and Date */
    const allData = await request.json();
    let datetime = new Date(allData.date);
    let hour = allData.date.substring(11,13);
    let minute = allData.date.substring(14,16);
    let day = allData.date.substring(8,10);
    let month = allData.date.substring(5,7);
    let weekday = week[datetime.getDay()];
    /* Check what time of the day it is to style the page proberly */
    if(hour >= 6 && hour <= 16){
      daytime();
    }
    else if (hour >= 17 && hour<= 20){
      sunset();
    }
    else{
      night();
    }

    if (!isMilitaryTime){
      minute = (hour - 12) > 0 ? minute +' '+'PM' : minute+' '+'AM';
      hour = (hour - 12) > 0 ? hour - 12 : hour;
      if (hour == '00' && minute.includes('AM')){
        hour = '12';
      }
    }
    if(isFahrenheit){
      temp.innerHTML = `${Math.round(allData.temp * 1.8 + 32)} °F <span style="font-size: 24px;">${allData.country}</span>`;
      temp.firstChild.innerHTML = ' ' + allData.country;
    }
    else{
      temp.innerHTML = `${Math.round(allData.temp)} °C <span style="font-size: 24px;">${allData.country}</span>`;
      temp.firstChild.innerHTML = ' ' + allData.country;
    }
    time.innerHTML = hour +':'+ minute +' '+ weekday +' '+ month +'/'+ day;
  }
  catch(error){
    alert('Api Request on Cooldown Please wait for 10 Seconds and re-select');
    location.reload();
  }
}

menu.addEventListener('click', function(e){ //the event listener for the menu items to intiate the api requests through a GET request
  cityName = e.target.querySelector('.name').innerHTML;
  apiRequest1 = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey1}`;
  apiRequest2 = `https://timezone.abstractapi.com/v1/current_time/?api_key=${apiKey2}&location=${cityName}`
  getData(apiRequest1,apiRequest2)
  .then(function(){ // chain a POST route to save data from the apis to the endpoint
    try{
      postData('/addData',{temp: data.main.temp , date: data.datetime , country: data.sys.country});
    }
    catch(error){
      console.log(error,'error');
    }
  })
  .then(function(){// chain the method to update the ui with our new data entry
    locationBtn.click(); //close the menu
    updateUi();
  });
});

function googleSearch(){// search the given query
  let query = document.querySelector('.search-bar').value;
  let url = `https://www.google.com/search?q=${query}`;
  window.location.href = url;
}

document.body.addEventListener('keypress',function check(e){// intiate search if the enter button is pressed while the search bar is on focus
  console.log(e);
  if(document.activeElement === document.querySelector('.search-bar')&& (e.key == 'Enter' || e.key == 'NumpadEnter')){
    googleSearch();
  }
});