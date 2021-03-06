const fs = require('fs');
const cors = require('cors');
const express = require('express');
const EventEmitter = require('events');
const http = require('http');
const config = require('./config');

const app = express();

app.use(cors());
let eventEmitter = new EventEmitter();

const filterCities = (err, citiesList, search) => {
    citiesList = JSON.parse(citiesList);
    let filteredCities = [];
    if(search.length && search.length > 2){
        filteredCities = citiesList.filter(city => city.name.toString().toLowerCase().startsWith(search));
    } else {
        for(let i = 0;i <= 50;i++){
            filteredCities.push(citiesList[i]);
        }
    }
    eventEmitter.emit('successCall', filteredCities);
}

const getCitiesList = (search) => {
    fs.readFile('city.list.json', {flag: 'rs', encoding: 'utf8'}, (err, res) => filterCities(err, res, search));
}

app.get(`${config.baseUrl}/api/cities`, (req, res) => {
    getCitiesList('');
    // remove successCall event emitter is exists to call again
    if(eventEmitter._events['successCall']) delete(eventEmitter._events['successCall']);
    eventEmitter.on('successCall', (filteredCities) => {
        res.send(filteredCities);
    });
});

app.get(`${config.baseUrl}/api/cities/:search`, (req, res) => {
    let search = req.params.search;
    getCitiesList(search);
    // remove successCall event emitter is exists to call again
    if(eventEmitter._events['successCall']) delete(eventEmitter._events['successCall']);
    eventEmitter.on('successCall', (filteredCities) => {
        res.send(filteredCities);
    });
});

let httpServer = http.createServer(app);
httpServer.listen(8000, () => {
    console.log('server is listening on port 8000');
});