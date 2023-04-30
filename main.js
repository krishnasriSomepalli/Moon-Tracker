window.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('canvas');
    var engine = new BABYLON.Engine(canvas, true);
    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0,35,0), scene);
        camera.attachControl(canvas, true);
        camera.minZ = 0.45;
        
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

        //skymaterial
        var skyboxMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
        skyboxMaterial.backFaceCulling = false;

        // skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
        skybox.material = skyboxMaterial;

        // ground
        const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", "textures/heightMap3.png", {width:1000, height:1000, subdivisions:100, maxHeight: 50});
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
        groundMaterial.diffuseTexture.uScale = 6;
        groundMaterial.diffuseTexture.vScale = 6;
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.position.y = -2.05;
        ground.material = groundMaterial;

        let sphere = new BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 5});
        let moon_mat = new BABYLON.StandardMaterial("mat0", scene);
        moon_mat.diffuseTexture = new BABYLON.Texture("./textures/moon.png", scene);
        sphere.material = moon_mat;

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

        // moon position
        let moonPos = SunCalc.getMoonPosition(datetime, lat, lng);
        let moon_now_coords = getCartesian(moonPos.azimuth, moonPos.altitude);
        sphere.position = new BABYLON.Vector3(moon_now_coords.x,moon_now_coords.y,moon_now_coords.z);

        let moonTimes = SunCalc.getMoonTimes(datetime, lat, lng);
        let moonrise = SunCalc.getMoonPosition(moonTimes.rise, lat, lng);
        let moonset = SunCalc.getMoonPosition(moonTimes.set, lat, lng);

        let moon_rise_coords = getCartesian(moonrise.azimuth, moonrise.altitude);
        let moon_set_coords = getCartesian(moonset.azimuth, moonset.altitude);

        const f = new BABYLON.Vector3(moon_now_coords.x, moon_now_coords.y, moon_now_coords.z);
        const s = new BABYLON.Vector3(moon_rise_coords.x, moon_rise_coords.y, moon_rise_coords.z);
        const t = new BABYLON.Vector3(moon_set_coords.x, moon_set_coords.y, moon_set_coords.z);
        const arc = BABYLON.Curve3.ArcThru3Points(f, s, t, 32, false, true);
        const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: arc.getPoints()})

        // animation
        let frameRate = 10;
        // let keyFrames = calculateKeyFrames(datetime, lat, lng);
        // console.log(keyFrames);
        let keyFrames = {
            x: [{frame:0,value:moon_rise_coords.x}, {frame:10,value:moon_now_coords.x},{frame:20,value:moon_set_coords.x},{frame:30,value:moon_rise_coords.x}],
            y: [{frame:0,value:moon_rise_coords.y}, {frame:10,value:moon_now_coords.y},{frame:20,value:moon_set_coords.y},{frame:30,value:moon_rise_coords.y}],
            z: [{frame:0,value:moon_rise_coords.z}, {frame:10,value:moon_now_coords.z},{frame:20,value:moon_set_coords.z},{frame:30,value:moon_rise_coords.z}]
        };

        let xSlide = new BABYLON.Animation("xSlide", "position.x", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let ySlide = new BABYLON.Animation("ySlide", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let zSlide = new BABYLON.Animation("zSlide", "position.z", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        xSlide.setKeys(keyFrames.x);
        ySlide.setKeys(keyFrames.y);
        zSlide.setKeys(keyFrames.z);

        sphere.animations.push(xSlide);
        sphere.animations.push(ySlide);
        sphere.animations.push(zSlide);

        scene.beginAnimation(sphere, 0, 30, true, 0.25);

        // north pointer - temp
        let sphere_north = new BABYLON.MeshBuilder.CreateSphere("sphere_north", {diameter: 5});
        var greenMat = new BABYLON.StandardMaterial("redMat", scene);
	    greenMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
        sphere_north.material = greenMat;
        sphere_north.position = new BABYLON.Vector3(0,0,50);

        const horizontal = BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(-50,0,0), new BABYLON.Vector3(50,0,0)]});
        const vertical = BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,0,-50), new BABYLON.Vector3(0,0,50)]});
        horizontal.color = new BABYLON.Color3(1,0,1);
        vertical.color = new BABYLON.Color3(1,0,1);

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
        inputPanel.height = "220px";
        inputPanel.paddingTop = "20px";
        inputPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        inputPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        inputPanel.isVisible = true;
        advancedTexture.addControl(inputPanel);
			
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
        cityInput.text = "Austin";
        cityName = "Austin";
        cityInput.color = "white";
        cityInput.background = "gray";
              
        cityInput.onTextChangedObservable.add(e => {
            var sInput = parseInt(e.text);
            cityName = sInput;
        });
        inputPanel.addControl(cityInput);
			
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
        timeInput.text = "14:00";
        finalTime = "14:00";
        timeInput.color = "white";
        timeInput.background = "gray";
              
        timeInput.onTextChangedObservable.add(e => {
            var sInput = parseInt(e.text);
            finalTime = sInput;
        });
        inputPanel.addControl(timeInput);
			
			
        var playBtn = BABYLON.GUI.Button.CreateSimpleButton("but", "Show path");
        playBtn.width = 0.5;
        playBtn.height = "50px";
        playBtn.paddingTop = "20px";
        playBtn.color = "white";
        inputPanel.addControl(playBtn);
        playBtn.onPointerClickObservable.add(function (value) {
            console.log(cityName);
            console.log(finalTime);
            //Add data fetch call here
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

        const processCsv = () => {
            var fileName = "uscities.csv";
            BABYLON.Tools.LoadFile(fileName, (data) => {
                //console.log("here");
                const csv=data.split("\n");
                const result=csv.find((it, index) => {
                //console.log(index,it);
                const row=it.split(",");
                //console.log(row);
                if(row[0] === '"Austin"' ) // parameterize with cityName
                    return row;
                })
                //console.log(result.split(",")[6],result.split(",")[7]);
                //console.log(result);
                const lat=result.split(",")[6];
                const long=result.split(",")[7];
                console.log(lat,long);
                });
        }
        processCsv();

        return scene;
    }

    var scene = createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });
});

// accepts azimuth and altitude in radians
// returns corresponding Cartesian coordinates
function getCartesian(azimuth, altitude) {
    p = 100;

    x = p*Math.cos(altitude)*Math.sin(azimuth);
    y = p*Math.sin(altitude);
    z = p*Math.cos(altitude)*Math.cos(azimuth);

    return {x, y, z};
}