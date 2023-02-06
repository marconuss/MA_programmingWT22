import {
    Scene,
    Mesh,
    Vector3,
    SceneLoader,
    MeshBuilder,
    TransformNode,
    PBRMetallicRoughnessMaterial, Texture
} from "@babylonjs/core";
import {BeerCup} from "./beerCup";

export class Environment {
    private _scene: Scene;

    //Meshes
    private _beerCupObjs: Array<BeerCup>; 
    private _blueCupMtl: PBRMetallicRoughnessMaterial; 
    private _redCupMtl: PBRMetallicRoughnessMaterial;

    constructor(scene: Scene) {
        this._scene = scene;
        
        this._beerCupObjs = [];
        
        const blueCupMtl = new PBRMetallicRoughnessMaterial("Blue beer cup", this._scene);
        blueCupMtl.emissiveTexture = new Texture("/assets/textures/BeerCupBlue.png", this._scene, true, false);
        this._blueCupMtl = blueCupMtl;
        
        const redCupMtl = new PBRMetallicRoughnessMaterial("Red beer cup", this._scene);
        redCupMtl.emissiveTexture = new Texture("/assets/textures/BeerCupRed.png", this._scene, true, false);
        this._redCupMtl = redCupMtl;
    }

    public async load() {
        var ground = MeshBuilder.CreateBox("ground", {size: 24}, this._scene);
        ground.scaling = new Vector3(1,.02,1);
        
        const assets = await this.loadAssets()
        const scaleMultiplier = 5;
        
        assets.allMeshes.forEach((m) => {
            m.receiveShadows = true;
            m.checkCollisions = true;
            m.addRotation(0, 0, Math.PI/2); 
            m.scaling = new Vector3(scaleMultiplier, scaleMultiplier, scaleMultiplier);
        })
        
        const cupsPositions: Vector3[] = [
            new Vector3(0, 1, 0),
            new Vector3(0.25, 1, -0.25),
            new Vector3(-0.25, 1, -0.25),
            new Vector3(0.5, 1, -0.5),
            new Vector3(0, 1, -0.5),
            new Vector3(-0.5, 1, -0.5),
            new Vector3(0.75, 1, -0.75),
            new Vector3(0.25, 1, -0.75),
            new Vector3(-0.25, 1, -0.75),
            new Vector3(-0.75, 1, -0.75)
        ];
        
        // beer cups
        assets.beerCup.isVisible = false;
        
        const beerCupsHolder = new TransformNode("beerCupsHolder", this._scene);
        for (let i = 0; i < 10; i++){
            let beerCupInstance = assets.beerCup.clone("beerCup " + i);
            beerCupInstance.isVisible = true;
            beerCupInstance.setParent(beerCupsHolder);

            //Create the new beerCup object
            let newBeerCup = new BeerCup(
                this._blueCupMtl,
                beerCupInstance,
                this._scene,
                cupsPositions[i]
            );

            this._beerCupObjs.push(newBeerCup);
        }
        assets.beerCup.dispose();
    }
    
    public async loadAssets(){
        const result = await SceneLoader.ImportMeshAsync(null, "./assets/models/", "Table.glb", this._scene);
        
        let env = result.meshes[0]; 
        let allMeshes = env.getChildMeshes();
        
        const res = await SceneLoader.ImportMeshAsync(null, "./assets/models/", "BeerCup.glb", this._scene);
        let beerCup = res.meshes[0].getChildren()[0];
        beerCup.parent = null;
        res.meshes[0].dispose();
        
        return {
            env: env,
            allMeshes: allMeshes,
            beerCup: beerCup as Mesh
        }
    }
}