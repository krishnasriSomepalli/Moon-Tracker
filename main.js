window.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('canvas');
    var engine = new BABYLON.Engine(canvas, true);
    var createScene = function () {
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
        altitude = 39.94;
        azimuth = 128.84;
        theta = (90-altitude)*Math.PI/180;
        phi = (azimuth)*Math.PI/180;
        p = 150;
        y = p*Math.sin(phi)*Math.cos(theta);
        x = p*Math.sin(phi)*Math.sin(theta);
        z = p*Math.cos(phi);
        console.log(x, y, z);
        sphere.position = new BABYLON.Vector3(x,y,z)

        //const horizontal = BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(-50,0,0), new BABYLON.Vector3(50,0,0)]});
        //const vertical = BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,0,-50), new BABYLON.Vector3(0,0,50)]});
        //horizontal.color = new BABYLON.Color3(1,0,1);
        //vertical.color = new BABYLON.Color3(1,0,1);


var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	
 		//Input BABYLON.GUI
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
                     //resetSimulation();
                     console.log(cityName)
                 });

                
                 let pnts = [new BABYLON.Vector3(-50,0,0),new BABYLON.Vector3(0,50,0), new BABYLON.Vector3(50,0,0)] // // parameterize with data fetch array of moon co-ordinates

                 let dashedlines = BABYLON.MeshBuilder.CreateDashedLines("dashedlines",{points: pnts});

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