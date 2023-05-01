FRAMERATE = 10

// Default to the datetime now
// datetime = Date.now();
datetime = new Date("2023-04-30T22:15:00");

// Default to Austin
lat = 30.267153; 
lng = -97.7430608;
// navigator.geolocation.getCurrentPosition((position) => {
//     lat = position.coords.latitude;
//     lng = position.coords.longitude;
// });

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

        // camera
        var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0,35,0), scene);
        camera.attachControl(canvas, true);
        camera.minZ = 0.45;
        
        // light
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));
        light.specular = new BABYLON.Color3(0.2,0.2,0.2);
        light.intensity = 0.8;

        // skymaterial
        var skyMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
        skyMaterial.backFaceCulling = false;
        
        // skybox - sky
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
        skybox.material = skyMaterial;
        skybox.material.inclination = 0.25;
        skybox.material.azimuth = 0;

        // stars
        // let starsMaterial = new BABYLON.StandardMaterial("stars", scene);
        // starsMaterial.backFaceCulling = false;
        // starsMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/stars", scene); // update to black dots on white bg
        // starsMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        // starsMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        // starsMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        // starsMaterial.alpha = 0.1;
        // starsMaterial.alphaMode = BABYLON.Engine.ALPHA_MAXIMIZED;

        // skybox - stars
        // let starsbox = BABYLON.Mesh.CreateBox("skyBox", 800.0, scene);
        // starsbox.material = starsMaterial;

        // ground
        const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", "textures/heightMap3.png", {width:1000, height:1000, subdivisions:100, maxHeight: 50});
        
        let groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
        groundMaterial.diffuseTexture.uScale = 6;
        groundMaterial.diffuseTexture.vScale = 6;
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.position.y = -2.05;
        ground.material = groundMaterial;

        // moon
        let moon = new BABYLON.MeshBuilder.CreateSphere("moon", {diameter: 5});
        let moon_mat = new BABYLON.StandardMaterial("mat0", scene);
        moon_mat.diffuseTexture = new BABYLON.Texture("./textures/moon.png", scene);
        moon_mat.emissiveColor = new BABYLON.Color3(0.8,0.8,0.8);
        moon.material = moon_mat;

        // moon position
        let moonPos = SunCalc.getMoonPosition(datetime, lat, lng);
        let moon_now_coords = getCartesian(moonPos.azimuth, moonPos.altitude);
        moon.position = new BABYLON.Vector3(moon_now_coords.x,moon_now_coords.y,moon_now_coords.z);

        const moonPositions = calculateMoonPositionsInADay(datetime, lat, lng);
        const arc = BABYLON.Curve3.CreateCatmullRomSpline(moonPositions, 100, true);
        const arcLine = BABYLON.Mesh.CreateLines("catmullRom", arc.getPoints(), scene);

        // moon animations
        const moonKeyFrames = calculateMoonKeyFrames(moonPositions);
        setupMoonAnimation(scene, moon, moonKeyFrames);

        // sky animation
        const sunPositions = calculateSunPositionsInADay(datetime, lat, lng);
        const sunKeyFrames = calculateSunKeyFrames(sunPositions);
        setupSkyAnimation(scene, skybox, sunKeyFrames)

        // setup controls
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        // title
        setupTitle(advancedTexture)

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
                
        return scene;
    }
    
    var scene = await createScene();

    engine.runRenderLoop(function () {
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

    scene.beginAnimation(moon, 0, 24*FRAMERATE, true, 1);
}

function setupSkyAnimation(scene, skybox, sunKeyFrames) {
    let sunAz = new BABYLON.Animation("sunAz", "material.azimuth", FRAMERATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let sunAl = new BABYLON.Animation("sunAl", "material.inclination", FRAMERATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    sunAz.setKeys(sunKeyFrames.az);
    sunAl.setKeys(sunKeyFrames.al);

    scene.beginDirectAnimation(skybox, [sunAz], 0, 24*FRAMERATE, true, 1);
    scene.beginDirectAnimation(skybox, [sunAl], 0, 24*FRAMERATE, true, 1);
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
    positions.az.push(positions.az[0]);
    positions.al.push(positions.al[0]);

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

function setupTitle(advancedTexture) {
    let panel = new BABYLON.GUI.StackPanel();
    panel.width = "420px";
    panel.height = "200px";
    panel.paddingTop = "20px";
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    panel.isVisible = true;
    advancedTexture.addControl(panel);

    let title = new BABYLON.GUI.TextBlock();
    title.height = "20px";
    title.paddingTop = "5px";
    title.color = "white";
    title.text = "Moon Tracker";
    title.fontSize = 20;
    panel.addControl(title);
}

// accepts azimuth and altitude in radians
// returns corresponding Cartesian coordinates
function getCartesian(azimuth, altitude) {
    const p = 100;

    let x = p*Math.cos(altitude)*Math.sin(azimuth);
    let y = p*Math.sin(altitude);
    let z = p*Math.cos(altitude)*Math.cos(azimuth);

    return {x, y, z};
}

function toDegrees(radians) {
	return radians * 180 / Math.PI;
}

function toAzimuthInterval(degrees) {
    if (degrees < 0) {
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