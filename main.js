FRAMERATE = 10

// Default to the current date and time
datetimeGlobal = new Date();

// Default to Austin
latitudeGlobal = 30.267153; 
longitudeGlobal = -97.7430608;

cityGlobal = 'Austin';
countryGlobal = 'United States';
postcodeGlobal = '78705';

//We are using city, country, post/zipcode and time to get the position of the moon
//geoapifyAPI is being used to get geo code (longitude and latitude) based on above 
//information and reverse geo code (city, country, post/zip code) based on current location'slatitude and longitude.
let geoapifyAPIKey = '220654fd185f4701a933e938b683da70'

// call Geocoding API - https://www.geoapify.com/geocoding-api/
async function geocodeAddress(city, country, postcode) {
    const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?city=${city}&country=${country}&postcode=${postcode}&apiKey=${geoapifyAPIKey}`;

    const coordinates = await fetch(geocodingUrl).then(result => result.json())
    .then(featureCollection => {
        return featureCollection.features[0].geometry.coordinates;
    });
    return coordinates  
}

async function getMoonCanvas(){
    var canvas = document.getElementById('canvas');
    var engine = new BABYLON.Engine(canvas, true);
    var createScene = async function () {
        let scene = new BABYLON.Scene(engine);

        // camera
        let camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0,35,0), scene);
        camera.attachControl(canvas, true);
        camera.minZ = 0.45;

        // light
        let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));
        light.specular = new BABYLON.Color3(0.2,0.2,0.2);
        light.intensity = 0.8;

        // skymaterial
        let skyMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
        skyMaterial.backFaceCulling = false;
        
        // skybox - sky
        let skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
        skybox.material = skyMaterial;
        skybox.material.inclination = 0.25;
        skybox.material.azimuth = 0;

        // stars
        let starsMaterial = new BABYLON.StandardMaterial("stars", scene);
        starsMaterial.backFaceCulling = false;
        starsMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/stars", scene); // update to black dots on white bg
        starsMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        starsMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        starsMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        starsMaterial.alpha = 0.3;
        starsMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;

        // skybox - stars
        let starsbox = BABYLON.Mesh.CreateBox("skyBox", 900.0, scene);
        starsbox.material = starsMaterial;

        // ground
        let ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", "textures/heightMap3.png", {width:1000, height:1000, subdivisions:100, maxHeight: 50});
        
        let groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
        groundMaterial.diffuseTexture.uScale = 6;
        groundMaterial.diffuseTexture.vScale = 6;
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.position.y = -2.05;
        ground.material = groundMaterial;

        let { moon, arcLine } = draw(scene, skybox, datetimeGlobal, latitudeGlobal, longitudeGlobal);
        camera.lockedTarget = moon;
        camera.radius = 200;

        // setup title and input controls
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        // title
        let titlePanel = createPanel("420px", "200px", BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER, BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP);
        advancedTexture.addControl(titlePanel);

        let title = createTextBlock("Moon Tracker");
        titlePanel.addControl(title);

        // inputs
        let inputPanel = createPanel("220px", "350px", BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT, BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP);
        advancedTexture.addControl(inputPanel);

        // city input
        let city = createTextBlock("Enter City");
        let cityInput = createInputText(cityGlobal);    
        cityInput.onTextChangedObservable.add(e => {
            cityGlobal = cityInput.text
        });
        inputPanel.addControl(city);
        inputPanel.addControl(cityInput);

        // country input
        let country = createTextBlock("Enter Country");
        let countryInput = createInputText(countryGlobal);     
        countryInput.onTextChangedObservable.add(e => {
            countryGlobal = countryInput.text   
        });
        inputPanel.addControl(country);	
        inputPanel.addControl(countryInput);

        // postcode input
        let postcode = createTextBlock("Postcode");
        let postcodeInput = createInputText(postcodeGlobal);     
        postcodeInput.onTextChangedObservable.add(e => {
            postcodeGlobal = postcodeInput.text
        });
        inputPanel.addControl(postcode);
        inputPanel.addControl(postcodeInput);

        // date input
        let date = createTextBlock("Enter Date");
        let dateInput = createInputText(getDateString(datetimeGlobal));    
        dateInput.onTextChangedObservable.add(e => {
            let date = Date.parse(dateInput.text);
            if (!isNaN(date)) {
                datetimeGlobal = new Date(dateInput.text);
            }
        });
        inputPanel.addControl(date);
        inputPanel.addControl(dateInput);

        // time input
        let time = createTextBlock("Enter Time");
        let timeInput = createInputText(getTimeString(datetimeGlobal));    
        timeInput.onTextChangedObservable.add(e => {
            let timeString = timeInput.text;
            let timeParts = timeString.split(':');
            let hours = parseInt(timeParts[0]);
            let mins = parseInt(timeParts[1]);
            if (!(isNaN(hours) && isNaN(mins) && hours>23 && hours<0 && mins>59 && mins<0)){
                let date = new Date(dateInput.text) || Date.now();
                date.setHours(hours, mins);
                datetimeGlobal = date;
            }
        });
        inputPanel.addControl(time);
        inputPanel.addControl(timeInput);          

        // button
        var playBtn = BABYLON.GUI.Button.CreateSimpleButton("button", "Apply Parameters");
        playBtn.width = 0.7;
        playBtn.height = "50px";
        playBtn.paddingTop = "20px";
        playBtn.color = "white";
        inputPanel.addControl(playBtn);
        playBtn.onPointerClickObservable.add(async function () {
            [longitudeGlobal, latitudeGlobal] = await geocodeAddress(cityGlobal, countryGlobal, postcodeGlobal)
  
            scene.stopAllAnimations();
            camera.lockedTarget = null;
            moon.dispose();
            arcLine.dispose();
            let meshes = draw(scene, skybox, datetimeGlobal, latitudeGlobal, longitudeGlobal);
            moon = meshes.moon;
            arcLine = meshes.arcLine;
            camera.lockedTarget = moon;
        });

        const NS = [
            new BABYLON.Vector3(0,200,3000),
            new BABYLON.Vector3(0,200,-3000)
        ];
        const NSAxis = BABYLON.MeshBuilder.CreateDashedLines("lines", {points: NS});
        NSAxis.color = new BABYLON.Color3(0,0,0);

        const EW = [
            new BABYLON.Vector3(-3000,200,0),
            new BABYLON.Vector3(3000,200,0)
        ];
        const EWAxis = BABYLON.MeshBuilder.CreateDashedLines("lines", {points: EW});
        EWAxis.color = new BABYLON.Color3(0,0,0);
                
        return scene;
    }
    
    var scene = await createScene();

    engine.runRenderLoop(function () {
        scene.render();
    });
}    

//Executes when user allows the location access request  
async function getLocation_success(position) {
    latitudeGlobal  = position.coords.latitude
    longtitudeGlobal = position.coords.longitude

    await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitudeGlobal}&lon=${longtitudeGlobal}&format=json&apiKey=${geoapifyAPIKey}`)
    .then(response => response.json())
    .then(result => {
      countryGlobal = result.results[0].country
      cityGlobal = result.results[0].city
      postcodeGlobal = result.results[0].postcode 
    })
    .catch(error => console.log('error', error));
    getMoonCanvas();
  }
  
//Executes when user blocks the location access request  
async function getLocation_error(position) {
    getMoonCanvas();
}

window.addEventListener('DOMContentLoaded', async function () {
    //By default, sets geocoordinates to user's current location
    //If user denies location access, default to Austin, United States, 78705
    if (navigator.geolocation) {
        await navigator.geolocation.getCurrentPosition(getLocation_success, getLocation_error);
    }
    else {
        var canvas = document.getElementById('canvas');
        canvas.innerHTML = "Geolocation is not supported by this browser";
    }
});

// Draws the moon
// Animates moon position in a 24hr window
// Animates sun position in the sky
function draw(scene, skybox, datetime, lat, lng) {
    // moon
    let moon = new BABYLON.MeshBuilder.CreateSphere("moon", {diameter: 25});
    let moon_mat = new BABYLON.StandardMaterial("mat0", scene);
    moon_mat.diffuseTexture = new BABYLON.Texture("./textures/moon.png", scene);
    moon_mat.emissiveColor = new BABYLON.Color3(0.8,0.8,0.8);
    moon.material = moon_mat;

    // moon path
    const moonPositions = calculateMoonPositionsInADay(datetime, lat, lng);
    const arc = BABYLON.Curve3.CreateCatmullRomSpline(moonPositions, 100, true);
    const arcLine = BABYLON.Mesh.CreateLines("catmullRom", arc.getPoints());
    arcLine.alpha = 0.5;

    // moon animations
    const moonKeyFrames = calculateMoonKeyFrames(moonPositions);
    setupMoonAnimation(scene, moon, moonKeyFrames);

    // sky animation
    const sunPositions = calculateSunPositionsInADay(datetimeGlobal, latitudeGlobal, longitudeGlobal);
    const sunKeyFrames = calculateSunKeyFrames(sunPositions);
    setupSkyAnimation(scene, skybox, sunKeyFrames)

    return {moon, arcLine};
}

function setupMoonAnimation(scene, moon, moonKeyFrames) {
    let xSlide = new BABYLON.Animation("xSlide", "position.x", FRAMERATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let ySlide = new BABYLON.Animation("ySlide", "position.y", FRAMERATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let zSlide = new BABYLON.Animation("zSlide", "position.z", FRAMERATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    xSlide.setKeys(moonKeyFrames.x);
    ySlide.setKeys(moonKeyFrames.y);
    zSlide.setKeys(moonKeyFrames.z);

    moon.animations.push(xSlide);
    moon.animations.push(ySlide);
    moon.animations.push(zSlide);

    scene.beginAnimation(moon, 0, 24*FRAMERATE, true, 1.5);
}

function setupSkyAnimation(scene, skybox, sunKeyFrames) {
    let sunAz = new BABYLON.Animation("sunAz", "material.azimuth", FRAMERATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let sunAl = new BABYLON.Animation("sunAl", "material.inclination", FRAMERATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    sunAz.setKeys(sunKeyFrames.az);
    sunAl.setKeys(sunKeyFrames.al);

    scene.beginDirectAnimation(skybox, [sunAz], 0, 23*FRAMERATE, true, 1);
    scene.beginDirectAnimation(skybox, [sunAl], 0, 23*FRAMERATE, true, 1);
}

function calculateSunPositionsInADay(datetime, lat, lng) {
    let start_datetime = new Date(datetime.getMilliseconds() - 12*60*60*1000);
    let positions = {az:[], al:[]};

    for(let i=0; i<24; i++) {
        datetime_i = new Date(start_datetime.getMilliseconds() + (i*60*60*1000));
        let position = SunCalc.getPosition(datetime_i, lat, lng);
        let az = toAzimuthInterval(toDegrees(position.azimuth));
        let al = toAltitudeInterval(toDegrees(position.altitude));
        positions.az.push(az);
        positions.al.push(al);
    }
    return positions;
}

function calculateSunKeyFrames(positions) {
    let keyFrames = {az:[],al:[]};
    
    for(let i=0; i<24; i++) {
        keyFrames.az.push({frame:i*FRAMERATE, value:positions.az[i]});
        keyFrames.al.push({frame:i*FRAMERATE, value:positions.al[i]});
    }
    keyFrames.az.push({frame:24*FRAMERATE, value:positions.az[0]});
    keyFrames.al.push({frame:24*FRAMERATE, value:positions.al[0]});

    return keyFrames;
}

function calculateMoonPositionsInADay(datetime, lat, lng) {
    let start_datetime = new Date(datetime.getMilliseconds() - 12*60*60*1000);
    let positions = [];

    for(let i=0; i<24; i++) {
        datetime_i = new Date(start_datetime.getMilliseconds() + (i*60*60*1000));
        let position = SunCalc.getMoonPosition(datetime_i, lat, lng);
        let position_coords = getCartesian(position.azimuth, position.altitude);
        positions.push(new BABYLON.Vector3(position_coords.x, position_coords.y, position_coords.z));
    }

    return positions;
}

function calculateMoonKeyFrames(positions) {
    let keyFrames = {x:[],y:[],z:[]};
    
    for(let i=0; i<24; i++) {
        keyFrames.x.push({frame:i*FRAMERATE, value:positions[i].x});
        keyFrames.y.push({frame:i*FRAMERATE, value:positions[i].y});
        keyFrames.z.push({frame:i*FRAMERATE, value:positions[i].z});
    }
    keyFrames.x.push({frame:24*FRAMERATE, value:positions[0].x});
    keyFrames.y.push({frame:24*FRAMERATE, value:positions[0].y});
    keyFrames.z.push({frame:24*FRAMERATE, value:positions[0].z});

    return keyFrames;
}

function createPanel(width, height, horizontalAlignment, verticalAlignment) {
    let panel = new BABYLON.GUI.StackPanel();
    panel.width = width;
    panel.height = height;
    panel.horizontalAlignment = horizontalAlignment;
    panel.verticalAlignment = verticalAlignment;
    panel.paddingTop = "20px";    
    panel.isVisible = true;

    return panel
}

function createTextBlock(text) {
    let textBlock = new BABYLON.GUI.TextBlock();
    textBlock.height = "20px";
    textBlock.paddingTop = "5px";
    textBlock.color = "white";
    textBlock.fontSize = 15;
    textBlock.text = text;
    
    return textBlock
}

function createInputText(text) {
    let inputText = new BABYLON.GUI.InputText();
    inputText.width = 0.7;
    inputText.height = "30px";
    inputText.paddingTop = "0px";
    inputText.color = "white";
    inputText.background = "gray";
    inputText.text = text;

    return inputText;
}

// accepts azimuth and altitude in radians
// returns corresponding Cartesian coordinates
function getCartesian(azimuth, altitude) {
    const p = 500;

    let x = p*Math.cos(altitude)*Math.sin(azimuth);
    let y = p*Math.sin(altitude);
    let z = p*Math.cos(altitude)*Math.cos(azimuth);

    return {x, y, z};
}

function toDegrees(radians) {
	return radians*180/Math.PI;
}

function toAzimuthInterval(degrees) {
    if (degrees<0) {
        degrees = 360+degrees;
    }
    
    if (degrees>360) {
        degrees = degrees%360;
    }

    return degrees/360
}

function toAltitudeInterval(degrees){
    let interval = toAzimuthInterval(degrees);
    return -0.5+interval;
}

function getDateString(datetime) {
    const date = datetime.getUTCDate();
    const month = datetime.getUTCMonth()+1;
    const year = datetime.getUTCFullYear();

    return `${year}-${month}-${date}`;
}

function getTimeString(datetime) {
    const hours = datetime.getUTCHours();
    const minutes = datetime.getUTCMinutes();

    return `${hours}:${minutes}`;
}