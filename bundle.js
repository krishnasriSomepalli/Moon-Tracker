(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var SunCalc = require('suncalc');

//We are using city, country, post/zipcode and time to get the position of the moon
//geoapifyAPI is being used to get geo code (longitude and latitude) based on above 
//information and reverse geo code (city, country, post/zip code) based on current location'slatitude and longitude.
let citySearchGlobal  = 'Austin'
let countrySearchGlobal = 'United states'
let postcodeSearchGlobal = '78705'
let timeAndDateSearchGlobal = new Date()
let geoapifyAPIKey = '220654fd185f4701a933e938b683da70'
let X =''
let Y =''
let Z =''
async function geocodeAddress(city, country, postcode) {

    const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?city=${city}&country=${country}&postcode=${postcode}&apiKey=${geoapifyAPIKey}`;              
    // call Geocoding API - https://www.geoapify.com/geocoding-api/
    const coordinates = await fetch(geocodingUrl).then(result => result.json())
      .then(featureCollection => {
        return featureCollection.features[0].geometry.coordinates
      });
    return coordinates  
}
async function getMoonParameters(timeAndDate,latitude,longitude){
    const {azimuth, altitude, distance, parallacticAngle} = SunCalc.getMoonPosition(timeAndDate,latitude,longitude)
        theta = (90-altitude)*Math.PI/180;
        phi = (azimuth)*Math.PI/180;
        p = 150;
        y = p*Math.sin(phi)*Math.cos(theta);
        x = p*Math.sin(phi)*Math.sin(theta);
        z = p*Math.cos(phi); 
    return [x,y,z]  
}


// async function getLocationVectors(){
//         // Get geocode based on city, country and postcode
//         const [longitude, latitude] = await geocodeAddress(citySearchGlobal, countrySearchGlobal, postcodeSearchGlobal)
//         // Get moon position parameters based on longitude and 
//         const [x,y,z] = await getMoonParameters(timeAndDateSearchGlobal, latitude, longitude)        
// } 
async function getMoonCanvas(){
    var canvas = document.getElementById('canvas');
    var engine = new BABYLON.Engine(canvas, true);
    var createScene = async function () {
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2,  Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

        // Skybox
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:300.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("country", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/country", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.alpha = 0.90;
        skybox.material = skyboxMaterial;

        var sphere = new BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 5});
        const mat = new BABYLON.StandardMaterial("myMaterial", scene);
        mat.diffuseColor = new BABYLON.Color3(1, 1, 0);
        mat.alpha = 1;
        sphere.material = mat;
        
        // Get geocode based on city, country and postcode
        const [longitude, latitude] = await geocodeAddress(citySearchGlobal, countrySearchGlobal, postcodeSearchGlobal)
        // Get moon position parameters based on longitude and 
        const [x,y,z] = await getMoonParameters(timeAndDateSearchGlobal, latitude, longitude)
        sphere.position = new BABYLON.Vector3(x,y,z)
       

        var moon_stationary = new BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 5});
        const mat2 = new BABYLON.StandardMaterial("myMaterial", scene);
        mat2.diffuseColor = new BABYLON.Color3(1, 1, 1);
        mat2.alpha = 1;
        moon_stationary.material = mat2;
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");	
                 const instPanel = new BABYLON.GUI.StackPanel();
                 instPanel.width = "420px";
                 instPanel.height = "200px";
                 instPanel.paddingTop = "20px";
                 instPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                 instPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                 instPanel.isVisible = true;
                 advancedTexture.addControl(instPanel);

                 var instTxt = new BABYLON.GUI.TextBlock();
                 instTxt.height = "20px";
                 instTxt.paddingTop = "5px";
                 instTxt.color = "white";
                 instTxt.text = "Moon Tracker";
                 instTxt.fontSize = 20;
                 instPanel.addControl(instTxt);
              
			
 				//Input BABYLON.GUI
			
                 const inputPanel = new BABYLON.GUI.StackPanel();
                 inputPanel.width = "220px";
                 inputPanel.height = "440px";
                 inputPanel.paddingTop = "20px";
                 inputPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                 inputPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                 inputPanel.isVisible = true;
                 advancedTexture.addControl(inputPanel);
			
                 // City Input Box
                 var city = new BABYLON.GUI.TextBlock();
                 city.height = "20px";
                 city.paddingTop = "5px";
                 city.color = "white";
                 city.text = "Enter City";
                 city.fontSize = 15;
                 inputPanel.addControl(city);
			
                 var cityInput = new BABYLON.GUI.InputText();
                 cityInput.width = 0.5;
                 cityInput.height = "30px";
                 cityInput.paddingTop = "0px";
                 cityInput.text = citySearchGlobal;
                 //cityName = citySearchGlobal;
                 cityInput.color = "white";
                 cityInput.background = "gray";
              
                 cityInput.onTextChangedObservable.add(e => {
                     //var sInput = cityInput.text;
                     //console.log("^^^^^^")
                     //console.log(sInput)
                    // cityName = sInput;
                    citySearchGlobal = cityInput.text
                  
                 });
                 inputPanel.addControl(cityInput);

                // Country Input Box
                 var country = new BABYLON.GUI.TextBlock();
                 country.height = "20px";
                 country.paddingTop = "5px";
                 country.color = "white";
                 country.text = "Enter Country";
                 country.fontSize = 15;
                 inputPanel.addControl(country);
			
                 var countryInput = new BABYLON.GUI.InputText();
                 countryInput.width = 0.5;
                 countryInput.height = "30px";
                 countryInput.paddingTop = "0px";
                 countryInput.text = countrySearchGlobal;
                 countryName = countrySearchGlobal;
                 countryInput.color = "white";
                 countryInput.background = "gray";
              
                 countryInput.onTextChangedObservable.add(e => {
                    //  var sInput = countryInput.text;
                    //  console.log("^^^^^^")
                    //  console.log(sInput)
                    //  cityName = sInput;
                    countrySearchGlobal = countryInput.text
                  
                 });
                 inputPanel.addControl(countryInput);


                    // postcode Input Box
                    var postcode = new BABYLON.GUI.TextBlock();
                    postcode.height = "20px";
                    postcode.paddingTop = "5px";
                    postcode.color = "white";
                    postcode.text = "Post/Zip Code";
                    postcode.fontSize = 15;
                    inputPanel.addControl(postcode);
               
                    var postcodeInput = new BABYLON.GUI.InputText();
                    postcodeInput.width = 0.5;
                    postcodeInput.height = "30px";
                    postcodeInput.paddingTop = "0px";
                    postcodeInput.text = postcodeSearchGlobal;
                    postcodeName = postcodeSearchGlobal;
                    postcodeInput.color = "white";
                    postcodeInput.background = "gray";
                 
                    postcodeInput.onTextChangedObservable.add(e => {
                        // var sInput = postcodeInput.text;
                        // console.log("^^^^^^")
                        // console.log(sInput)
                        // postcodeName = sInput;
                        postcodeSearchGlobal = postcodeInput.text
                     
                    });
                    inputPanel.addControl(postcodeInput);

			    // Time Input Box
 				var time = new BABYLON.GUI.TextBlock();
                 time.height = "20px";
                 time.paddingTop = "5px";
                 time.color = "white";
                 time.text = "Enter Time";
                 time.fontSize = 15;
                 inputPanel.addControl(time);
			
                 var timeInput = new BABYLON.GUI.InputText();
                 timeInput.width = 0.5;
                 timeInput.height = "30px";
                 timeInput.paddingTop = "0px";
                 timeInput.text = timeAndDateSearchGlobal;
                 finalTime = timeAndDateSearchGlobal;
                 timeInput.color = "white";
                 timeInput.background = "gray";
              
                 timeInput.onTextChangedObservable.add(e => {
                    //  var sInput = e.text;
                    //  console.log('##Time##')
                    //  console.log(sInput)
                    //  finalTime = sInput;
                     timeAndDateSearchGlobal = timeInput.text
                  
                 });
                 inputPanel.addControl(timeInput);

                 // Show Path Button
 				var playBtn = BABYLON.GUI.Button.CreateSimpleButton("but", "Show path");
                 playBtn.width = 0.5;
                 playBtn.height = "50px";
                 playBtn.paddingTop = "20px";
                 playBtn.color = "white";
                 inputPanel.addControl(playBtn);
                 playBtn.onPointerClickObservable.add(async function (value) {
                    console.log("cityName")
                    console.log(value);
                    const [longitude, latitude] = await geocodeAddress(citySearchGlobal, countrySearchGlobal, postcodeSearchGlobal)
                    // Get moon position parameters based on longitude and 
                    const [x,y,z] = await getMoonParameters(timeAndDateSearchGlobal, latitude, longitude)
                    sphere.position = new BABYLON.Vector3(x,y,z)
                 });


                 const displayPanel = new BABYLON.GUI.StackPanel();
                 displayPanel.width = "420px";
                 displayPanel.height = "200px";
                 displayPanel.paddingTop = "20px";
                 displayPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                 displayPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                 displayPanel.isVisible = true;
                 advancedTexture.addControl(displayPanel);

                 var displayAnimationTime = new BABYLON.GUI.TextBlock();
                 displayAnimationTime.height = "20px";
                 displayAnimationTime.paddingTop = "5px";
                 displayAnimationTime.color = "black";
                 displayAnimationTime.text = "Moon location time display";
                 displayAnimationTime.fontSize = 15;
                 displayPanel.addControl(displayAnimationTime);

                moon_stationary.position=new BABYLON.Vector3(25,25,0);

                let pnts = [new BABYLON.Vector3(-50,0,0),new BABYLON.Vector3(0,50,0), new BABYLON.Vector3(50,0,0)] //parameterize with data fetch array of moon co-ordinates
                let dashedlines = BABYLON.MeshBuilder.CreateDashedLines("dashedlines",{points: pnts});
                
        return scene;
    }
    
    var scene = await createScene();
// This would be removed once array of altitude and azimuth data is fetched. arr would have these fetched values
    var arr=[];
    for (let xx = -50; xx <= 0; xx=xx+0.2) {
        let yy = xx+50;
        arr.push(new BABYLON.Vector3(xx,yy,0))
      } 
      for (let xx = 0; xx <= 50; xx=xx+0.2) {
        let yy = 50-xx;
        arr.push(new BABYLON.Vector3(xx,yy,0))
      }
      
    
    var array_index=0;

    engine.runRenderLoop(function () {
        var changingObj = scene.getMeshByName("sphere");
        changingObj.position=arr[array_index];
        
        array_index++;
        if(array_index==arr.length) {array_index=0;}
        

        scene.render();
    });
}    

//Executes when user allows the location access request  
async function getLocation_success(position) {
    const latitude  = position.coords.latitude
    const longtitude = position.coords.longitude
    await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longtitude}&format=json&apiKey=${geoapifyAPIKey}`)
    .then(response => response.json())
    .then(result => {
      countrySearchGlobal = result.results[0].country
      citySearchGlobal = result.results[0].city
      postcodeSearchGlobal = result.results[0].postcode 
      })
    .catch(error => console.log('error', error));
    getMoonCanvas()
  }
  
//Executes when user blocks the location access request  
async function getLocation_error(position) {
 getMoonCanvas()
  }

window.addEventListener('DOMContentLoaded', async function () {
  //By default, sets geocoordinates to user's current location
  //If user denies location access, default to Austin, United States, 78705
  if (navigator.geolocation) {
    console.log('Inside navigation')
    await navigator.geolocation.getCurrentPosition(getLocation_success, getLocation_error);
  }
else {
     var canvas = document.getElementById('canvas');
     canvas.innerHTML = "Geolocation is not supported by this browser.";
  }
});
},{"suncalc":2}],2:[function(require,module,exports){
/*
 (c) 2011-2015, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/moon position and light phases.
 https://github.com/mourner/suncalc
*/

(function () { 'use strict';

// shortcuts for easier to read formulas

var PI   = Math.PI,
    sin  = Math.sin,
    cos  = Math.cos,
    tan  = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad  = PI / 180;

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


// date/time constants and conversions

var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
function fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
function toDays(date)   { return toJulian(date) - J2000; }


// general calculations for position

var e = rad * 23.4397; // obliquity of the Earth

function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
function declination(l, b)    { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }

function azimuth(H, phi, dec)  { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }

function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }

function astroRefraction(h) {
    if (h < 0) // the following formula works for positive altitudes only.
        h = 0; // if h = -0.08901179 a div/0 would occur.

    // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
    // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
    return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}

// general sun calculations

function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }

function eclipticLongitude(M) {

    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
        P = rad * 102.9372; // perihelion of the Earth

    return M + C + P + PI;
}

function sunCoords(d) {

    var M = solarMeanAnomaly(d),
        L = eclipticLongitude(M);

    return {
        dec: declination(L, 0),
        ra: rightAscension(L, 0)
    };
}


var SunCalc = {};


// calculates sun position for a given date and latitude/longitude

SunCalc.getPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c  = sunCoords(d),
        H  = siderealTime(d, lw) - c.ra;

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: altitude(H, phi, c.dec)
    };
};


// sun times configuration (angle, morning name, evening name)

var times = SunCalc.times = [
    [-0.833, 'sunrise',       'sunset'      ],
    [  -0.3, 'sunriseEnd',    'sunsetStart' ],
    [    -6, 'dawn',          'dusk'        ],
    [   -12, 'nauticalDawn',  'nauticalDusk'],
    [   -18, 'nightEnd',      'night'       ],
    [     6, 'goldenHourEnd', 'goldenHour'  ]
];

// adds a custom time to the times config

SunCalc.addTime = function (angle, riseName, setName) {
    times.push([angle, riseName, setName]);
};


// calculations for sun times

var J0 = 0.0009;

function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }

function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
function solarTransitJ(ds, M, L)  { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }

function hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }
function observerAngle(height) { return -2.076 * Math.sqrt(height) / 60; }

// returns set time for the given sun altitude
function getSetJ(h, lw, phi, dec, n, M, L) {

    var w = hourAngle(h, phi, dec),
        a = approxTransit(w, lw, n);
    return solarTransitJ(a, M, L);
}


// calculates sun times for a given date, latitude/longitude, and, optionally,
// the observer height (in meters) relative to the horizon

SunCalc.getTimes = function (date, lat, lng, height) {

    height = height || 0;

    var lw = rad * -lng,
        phi = rad * lat,

        dh = observerAngle(height),

        d = toDays(date),
        n = julianCycle(d, lw),
        ds = approxTransit(0, lw, n),

        M = solarMeanAnomaly(ds),
        L = eclipticLongitude(M),
        dec = declination(L, 0),

        Jnoon = solarTransitJ(ds, M, L),

        i, len, time, h0, Jset, Jrise;


    var result = {
        solarNoon: fromJulian(Jnoon),
        nadir: fromJulian(Jnoon - 0.5)
    };

    for (i = 0, len = times.length; i < len; i += 1) {
        time = times[i];
        h0 = (time[0] + dh) * rad;

        Jset = getSetJ(h0, lw, phi, dec, n, M, L);
        Jrise = Jnoon - (Jset - Jnoon);

        result[time[1]] = fromJulian(Jrise);
        result[time[2]] = fromJulian(Jset);
    }

    return result;
};


// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

function moonCoords(d) { // geocentric ecliptic coordinates of the moon

    var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
        M = rad * (134.963 + 13.064993 * d), // mean anomaly
        F = rad * (93.272 + 13.229350 * d),  // mean distance

        l  = L + rad * 6.289 * sin(M), // longitude
        b  = rad * 5.128 * sin(F),     // latitude
        dt = 385001 - 20905 * cos(M);  // distance to the moon in km

    return {
        ra: rightAscension(l, b),
        dec: declination(l, b),
        dist: dt
    };
}

SunCalc.getMoonPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c = moonCoords(d),
        H = siderealTime(d, lw) - c.ra,
        h = altitude(H, phi, c.dec),
        // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
        pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));

    h = h + astroRefraction(h); // altitude correction for refraction

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: h,
        distance: c.dist,
        parallacticAngle: pa
    };
};


// calculations for illumination parameters of the moon,
// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
// Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

SunCalc.getMoonIllumination = function (date) {

    var d = toDays(date || new Date()),
        s = sunCoords(d),
        m = moonCoords(d),

        sdist = 149598000, // distance from Earth to Sun in km

        phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
        inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
        angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
                cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

    return {
        fraction: (1 + cos(inc)) / 2,
        phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
        angle: angle
    };
};


function hoursLater(date, h) {
    return new Date(date.valueOf() + h * dayMs / 24);
}

// calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article

SunCalc.getMoonTimes = function (date, lat, lng, inUTC) {
    var t = new Date(date);
    if (inUTC) t.setUTCHours(0, 0, 0, 0);
    else t.setHours(0, 0, 0, 0);

    var hc = 0.133 * rad,
        h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
        h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
    for (var i = 1; i <= 24; i += 2) {
        h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
        h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

        a = (h0 + h2) / 2 - h1;
        b = (h2 - h0) / 2;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + h1;
        d = b * b - 4 * a * h1;
        roots = 0;

        if (d >= 0) {
            dx = Math.sqrt(d) / (Math.abs(a) * 2);
            x1 = xe - dx;
            x2 = xe + dx;
            if (Math.abs(x1) <= 1) roots++;
            if (Math.abs(x2) <= 1) roots++;
            if (x1 < -1) x1 = x2;
        }

        if (roots === 1) {
            if (h0 < 0) rise = i + x1;
            else set = i + x1;

        } else if (roots === 2) {
            rise = i + (ye < 0 ? x2 : x1);
            set = i + (ye < 0 ? x1 : x2);
        }

        if (rise && set) break;

        h0 = h2;
    }

    var result = {};

    if (rise) result.rise = hoursLater(t, rise);
    if (set) result.set = hoursLater(t, set);

    if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

    return result;
};


// export as Node module / AMD module / browser variable
if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = SunCalc;
else if (typeof define === 'function' && define.amd) define(SunCalc);
else window.SunCalc = SunCalc;

}());

},{}]},{},[1]);
