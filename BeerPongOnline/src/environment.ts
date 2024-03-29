﻿import {
    CubeTexture,
    HemisphericLight,
    Matrix,
    Mesh,
    MeshBuilder,
    PBRMetallicRoughnessMaterial,
    PhysicsImpostor,
    Scene,
    SceneLoader,
    StandardMaterial,
    Texture,
    Vector3
} from "@babylonjs/core";


const SHOWCOLLIDER = false;

export class Environment {
    private _scene: Scene;

    private _assets;
    private _materials;

    constructor(scene: Scene) {
        this._scene = scene;
        
        // environmental textures for reflections on PBR materials
        this._scene.environmentTexture = new CubeTexture("./assets/textures/Sky.env", scene);
    }

    public async load() {

        const light0 = new HemisphericLight("HemiLight", new Vector3(1, 1, 0), this._scene);

        this._assets = await this.loadAssets();
        this._materials = await this._loadMaterials();


        // ground        
        const ground = MeshBuilder.CreateGround("ground", {width: 24, height: 24}, this._scene);
        ground.material = this._materials.groundMat;
        ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.PlaneImpostor,
            {mass: 0, restitution: 0.5}
        );

        //table
        const table = this._assets.table;
        table.addRotation(0, 0, Math.PI / 2);
        table.scaling.scaleInPlace(5);
        table.material = this._materials.tableMat;

        const tableCollider = MeshBuilder.CreateBox("tableCollider", {
            height: 4.12,
            width: 3.6,
            depth: 14.2
        }, this._scene);
        tableCollider.isVisible = SHOWCOLLIDER;
        tableCollider.bakeTransformIntoVertices(Matrix.Translation(0, 2.06, 0));

        table.parent = tableCollider;
        tableCollider.parent = null;

        // create physics Impostor for collider mesh
        tableCollider.physicsImpostor = new PhysicsImpostor(
            tableCollider,
            PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 0},
            this._scene
        );
        tableCollider.position = new Vector3(0, tableCollider.position.y - 2.06, 0);

        // beer cups
        const positionMultiplier = new Vector3(1.6, 1, 2.8);

        const positionOffset = new Vector3(0, 4.15, -4.5);

        this._createBeerCups(
            "redBeerCups",
            this._assets.beerCup,
            this._materials.redCupMat,
            positionMultiplier,
            positionOffset
        );

        this._createBeerCups(
            "blueBeerCups",
            this._assets.beerCup,
            this._materials.blueCupMat,
            new Vector3(positionMultiplier.x, positionMultiplier.y, -positionMultiplier.z),
            new Vector3(positionOffset.x, positionOffset.y, -positionOffset.z)
        );
        
        this._assets.beerCup.dispose();
    }

    public async loadAssets() {

        // import beer pong table mesh
        const tableContainer = await SceneLoader.ImportMeshAsync(null, "./assets/models/", "Table.glb", this._scene);
        let table = tableContainer.meshes[0].getChildren()[0];
        table.parent = null;
        tableContainer.meshes[0].dispose();

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

    private async _loadMaterials() {

        // ground material
        const groundMat = new StandardMaterial("Ground mat", this._scene);
        groundMat.diffuseTexture = new Texture("/assets/textures/Floor.png", this._scene, true, false);
        //groundMat.roughness = 1.0;


        // blue cup material
        const blueCupMat = new PBRMetallicRoughnessMaterial("Blue beer cup", this._scene);
        blueCupMat.baseTexture = new Texture("/assets/textures/BeerCupBlue.png", this._scene, true, false);
        blueCupMat.roughness = 0.2;
        blueCupMat.metallic = 0;

        // red cup material
        const redCupMat = new PBRMetallicRoughnessMaterial("Red beer cup", this._scene);
        redCupMat.baseTexture = new Texture("/assets/textures/BeerCupRed.png", this._scene, true, false);
        redCupMat.roughness = 0.2;
        redCupMat.metallic = 0;

        //table material
        const tableMat = new PBRMetallicRoughnessMaterial("Table material", this._scene);
        tableMat.baseTexture = new Texture("./assets/textures/Table.png", this._scene, true, false);
        tableMat.roughness = 0.5;
        tableMat.metallic = 0;

        return {
            groundMat: groundMat as StandardMaterial,
            blueCupMat: blueCupMat as PBRMetallicRoughnessMaterial,
            redCupMat: redCupMat as PBRMetallicRoughnessMaterial,
            tableMat: tableMat as PBRMetallicRoughnessMaterial
        }
    }

    private _createBeerCups(name: string, mesh: Mesh, beerMat: PBRMetallicRoughnessMaterial, positionMultiplier: Vector3, positionOffset: Vector3) {

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

        for (let i = 0; i < 10; i++) {

            // create clone from the beercup mesh
            const beerCupInstance = mesh.clone(name + i);
            beerCupInstance.material = beerMat;
            beerCupInstance.scaling.scaleInPlace(7.8);
            beerCupInstance.position = Vector3.Zero();

            // create collider mesh
            const beerCupCollider = MeshBuilder.CreateCylinder(beerCupInstance.name + "_root", {
                height: 0.9,
                diameterTop: 0.7,
                diameterBottom: 0.35
            }, this._scene);
            beerCupCollider.isVisible = SHOWCOLLIDER;
            //adjust the anchor of the collider mesh
            beerCupCollider.bakeTransformIntoVertices(Matrix.Translation(0, 0.45, 0));

            // parenting
            beerCupInstance.setParent(beerCupCollider);
            beerCupCollider.parent = null;

            // arrange beer cups
            beerCupCollider.position = new Vector3(
                cupsPositions[i].x * positionMultiplier.x + positionOffset.x,
                cupsPositions[i].y * positionMultiplier.y + positionOffset.y,
                cupsPositions[i].z * positionMultiplier.z + positionOffset.z
            );

            // create physics Impostor for collider mesh
            beerCupCollider.physicsImpostor = new PhysicsImpostor(
                beerCupCollider,
                PhysicsImpostor.CylinderImpostor,
                {mass: 0.2, restitution: 0}
            );
        }
    }
    
}