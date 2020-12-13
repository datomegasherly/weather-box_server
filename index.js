const fs = require('fs');
const cors = require('cors');
const express = require('express');
const EventEmitter = require('events');
const https = require('https');
const http = require('http');

const app = express();

let https_connection = false; // let be true if want to create server as https

if(https_connection){
	let privateKey = fs.readFileSync('server.key', 'utf8');
	let certificate = fs.readFileSync('server.crt', 'utf8');
	let credentials = {key: privateKey, cert: certificate};
}

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

app.get('/api/cities', (req, res) => {
    getCitiesList('');
    // remove successCall event emitter is exists to call again
    if(eventEmitter._events['successCall']) delete(eventEmitter._events['successCall']);
    eventEmitter.on('successCall', (filteredCities) => {
        res.send(filteredCities);
    });
});

app.get('/api/cities/:search', (req, res) => {
    let search = req.params.search;
    getCitiesList(search);
    // remove successCall event emitter is exists to call again
    if(eventEmitter._events['successCall']) delete(eventEmitter._events['successCall']);
    eventEmitter.on('successCall', (filteredCities) => {
        res.send(filteredCities);
    });
});

if(https_connection){
	let httpsServer = http.createServer(credentials, app);
	httpServer.listen(8443, () => {
		console.log('App render in HTTPS successfully and ready to execute');
	});
} else {
	let httpServer = http.createServer(app);
	httpServer.listen(8080, () => {
		console.log('App render in HTTP successfully and ready to execute');
	});
}