window.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('canvas');
    var engine = new BABYLON.Engine(canvas, true);
    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2,  Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        // camera.lowerRadiusLimit = camera.upperRadiusLimit = camera.radius = 1; // disables camera zoom

        // var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene);
        // light.diffuse = new BABYLON.Color3(1, 0, 0);
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
        // skybox.position = new BABYLON.Vector3(50,50,50);

        // const sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
        // sphereMaterial.diffuseColor = new BABYLON.StandardMaterial("sphereMaterial", scene);4
        // sphereMaterial.alpha = 0.5;

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

        // const box = BABYLON.MeshBuilder.CreateBox("box", {height: 1, width: 0.75, depth: 0.25});
        // const disc = BABYLON.MeshBuilder.CreateDisc("disc", {});
        // const torus = BABYLON.MeshBuilder.CreateTorus("torus", {thickness: 0.1, diameter: 50, tessellation: 100});
        // const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        // myMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
        // myMaterial.alpha = 1;
        // torus.material = myMaterial;
        // torus.rotation = new BABYLON.Vector3(1.571,0,0);
        // torus.position = new BABYLON.Vector3(0, -25, 0)

        
        // const points1 = [
        //     new BABYLON.Vector3(0, 0, 0),
        //     new BABYLON.Vector3(25, 0, 0)
        // ]
        // const line1 = BABYLON.MeshBuilder.CreateLines("lines", {points: points1});
        // line1.color = new BABYLON.Color3(1, 0, 0);
        // const points2 = [
        //     new BABYLON.Vector3(0, 0, 0),
        //     new BABYLON.Vector3(0, 25, 0)
        // ]
        // const line2 = BABYLON.MeshBuilder.CreateLines("lines", {points: points2});
        // line2.color = new BABYLON.Color3(0, 1, 0);
        // const points3 = [
        //     new BABYLON.Vector3(0, 0, 0),
        //     new BABYLON.Vector3(0, 0, 25)
        // ]
        // const line3 = BABYLON.MeshBuilder.CreateLines("lines", {points: points3});
        // line3.color = new BABYLON.Color3(0, 0, 1);

        const horizontal = BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(-50,0,0), new BABYLON.Vector3(50,0,0)]});
        const vertical = BABYLON.MeshBuilder.CreateLines("lines", {points: [new BABYLON.Vector3(0,0,-50), new BABYLON.Vector3(0,0,50)]});
        horizontal.color = new BABYLON.Color3(1,0,1);
        vertical.color = new BABYLON.Color3(1,0,1);

        return scene;
    }

    var scene = createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });
});