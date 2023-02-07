import {
    Scene,
    Mesh,
    Vector3,
    SceneLoader,
    MeshBuilder,
    TransformNode,
    PBRMetallicRoughnessMaterial, Texture, StandardMaterial, PBRMaterial
} from "@babylonjs/core";
import {BeerCup} from "./beerCup";

export class Environment {
    private _scene: Scene;

    //Meshes
    private _opBeerCupObjs: Array<BeerCup>;
    private _plBeerCupObjs: Array<BeerCup>;
    private _blueCupMtl: PBRMetallicRoughnessMaterial;
    private _redCupMtl: PBRMetallicRoughnessMaterial;
    private _tableMtl: PBRMetallicRoughnessMaterial;

    constructor(scene: Scene) {
        this._scene = scene;

        this._opBeerCupObjs = [];
        this._plBeerCupObjs = [];

        const blueCupMtl = new PBRMetallicRoughnessMaterial("Blue beer cup", this._scene);
        blueCupMtl.baseTexture = new Texture("/assets/textures/BeerCupBlue.png", this._scene, true, false);
        blueCupMtl.roughness = 0.2;
        blueCupMtl.metallic = 0;
        //blueCupMtl.transparencyMode = PBRMaterial.PBRMATERIAL_OPAQUE;
        this._blueCupMtl = blueCupMtl;

        const redCupMtl = new PBRMetallicRoughnessMaterial("Red beer cup", this._scene);
        redCupMtl.baseTexture = new Texture("/assets/textures/BeerCupRed.png", this._scene, true, false);
        redCupMtl.roughness = 0.2;
        redCupMtl.metallic = 0;
        //redCupMtl.transparencyMode = PBRMaterial.PBRMATERIAL_OPAQUE;
        this._redCupMtl = redCupMtl;

        const tableMtl = new PBRMetallicRoughnessMaterial("Table material", this._scene);
        tableMtl.baseTexture = new Texture("./assets/textures/Table.png", this._scene, true, false);
        tableMtl.roughness = 0;
        tableMtl.metallic = 0;
        //redCupMtl.transparencyMode = PBRMaterial.PBRMATERIAL_OPAQUE;
        this._tableMtl = tableMtl;
    }

    public async load() {
        var ground = MeshBuilder.CreateGround("ground", {width: 24, height: 24}, this._scene);
        const groundmtl = new StandardMaterial("groundmtl", this._scene);
        groundmtl.diffuseTexture = new Texture("./assets/textures/Floor.png", this._scene, true, false);
        ground.material = groundmtl;
        const assets = await this.loadAssets()
        const scaleMultiplier = 5;

        assets.table.checkCollisions = true;
        assets.table.addRotation(0, 0, Math.PI / 2);
        assets.table.scaling.scaleInPlace(scaleMultiplier);
        assets.table.material = this._tableMtl;

        /*
        assets.allMeshes.forEach((m) => {
            m.receiveShadows = true;
            m.checkCollisions = true;
            m.addRotation(0, 0, Math.PI/2); 
            m.scaling.scaleInPlace(scaleMultiplier);
        }
        */

        const cupsPositions: Vector3[] = [
            new Vector3(0, 0, 0),
            new Vector3(0.25, 0, -0.25),
            new Vector3(-0.25, 0, -0.25),
            new Vector3(0.5, 0, -0.5),
            new Vector3(0, 0, -0.5),
            new Vector3(-0.5, 0, -0.5),
            new Vector3(0.75, 0, -0.75),
            new Vector3(0.25, 0, -0.75),
            new Vector3(-0.25, 0, -0.75),
            new Vector3(-0.75, 0, -0.75)
        ];

        // opponent beer cups
        assets.beerCup.isVisible = false;

        const opBeerCupsHolder = new TransformNode("opBeerCupsHolder", this._scene);
        for (let i = 0; i < 10; i++) {
            let beerCupInstance = assets.beerCup.clone("opBeerCup " + i);
            beerCupInstance.isVisible = true;
            beerCupInstance.setParent(opBeerCupsHolder);

            //Create the new beerCup object
            let newOpBeerCup = new BeerCup(
                this._blueCupMtl,
                beerCupInstance,
                this._scene,
                cupsPositions[i]
            );

            this._opBeerCupObjs.push(newOpBeerCup);
        }
        opBeerCupsHolder.position = new Vector3(0, 4.15, -4.5);


        // player's beer cups
        const plBeerCupsHolder = new TransformNode("plBeerCupsHolder", this._scene);
        for (let i = 0; i < 10; i++) {
            let beerCupInstance = assets.beerCup.clone("plBeerCup " + i);
            beerCupInstance.isVisible = true;
            beerCupInstance.setParent(plBeerCupsHolder);


            let plCupPosition = cupsPositions[i];
            plCupPosition.z = -cupsPositions[i].z

            let newPlBeerCup = new BeerCup(
                this._redCupMtl,
                beerCupInstance,
                this._scene,
                plCupPosition
            );
            this._opBeerCupObjs.push(newPlBeerCup);
        }
        plBeerCupsHolder.position = new Vector3(0, 4.15, 4.5);


        assets.beerCup.dispose();
    }

    public async loadAssets() {

        // import beer pong table mesh
        const tableContainer = await SceneLoader.ImportMeshAsync(null, "./assets/models/", "Table.glb", this._scene);

        let table = tableContainer.meshes[0].getChildren()[0];

        // import singular beer cup mesh, this mesh will be cloned, so we can get rid off the root 
        const beerCupContainer = await SceneLoader.ImportMeshAsync(null, "./assets/models/", "BeerCup1.glb", this._scene);
        let beerCup = beerCupContainer.meshes[0].getChildren()[0];
        beerCup.parent = null;
        beerCupContainer.meshes[0].dispose();

        return {
            table: table as Mesh,
            beerCup: beerCup as Mesh
        }
    }
}