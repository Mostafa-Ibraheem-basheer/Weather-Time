// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Require Express to run server and routes
const express = require('express');
// Start up an instance of app
const app = express();
/* Middleware*/
const bodyParser = require('body-parser');
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());
// Initialize the main project folder
app.use(express.static('website'));


// Setup Server
const port = 8080;
function listening(){
    console.log(`running on localhost:${port}`);
}
const server = app.listen(port,listening);

app.post('/addData', function(request,response){//server-side POST route to save the new data from the api,user and the Date metohd to the endpoint projectData array
    newEntry = { //make a new entry with the our data
        date: request.body.date,
        temp: request.body.temp,
        country : request.body.country
    }
    projectData = Object.assign(newEntry); //save it in the endpoint array
    response.send(projectData);
});

app.get('/updateUi', function(request,response){ //the GET route to intiate the updateUi method
    response.send(projectData);
    for (var data in projectData){  //clear the endpoint from the old data
        delete projectData.data;
    }
})