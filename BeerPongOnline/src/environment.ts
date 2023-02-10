import {
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
    TransformNode,
    Vector3
} from "@babylonjs/core";
import {BeerCup} from "./beerCup";

export class Environment {
    private _scene: Scene;

    private _assets;
    private _materials;

    //Meshes
    private _opBeerCupObjs: Array<BeerCup>;
    private _plBeerCupObjs: Array<BeerCup>;

    constructor(scene: Scene) {
        this._scene = scene;

        this._opBeerCupObjs = [];
        this._plBeerCupObjs = [];
        
        // environmental textures for reflections on PBR materials
        this._scene.environmentTexture = new CubeTexture("./assets/textures/Sky.env", scene);;
    }

    public async load() {

        const light0 = new HemisphericLight("HemiLight", new Vector3(1, 1, 0), this._scene);

        var ground = MeshBuilder.CreateGround("ground", {width: 24, height: 24}, this._scene);
        const groundmtl = new StandardMaterial("groundmtl", this._scene);
        groundmtl.diffuseTexture = new Texture("./assets/textures/Floor.png", this._scene, true, false);
        groundmtl.roughness = 1.0;
        ground.material = groundmtl;


        ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 0.5}
        );


        this._assets = await this.loadAssets();
        this._materials = await this._loadMaterials();
        const scaleMultiplier = 5;

        //this._assets.table.checkCollisions = true;
        this._assets.table.addRotation(0, 0, Math.PI / 2);
        this._assets.table.scaling.scaleInPlace(scaleMultiplier);
        this._assets.table.position.y = -1.05;
        this._assets.table.material = this._materials.tableMat;

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
        
        const positionOffset = new Vector3(0, 4.15, -4.5);

        // opponent beer cups
        this._assets.beerCup.isVisible = false;

        const opBeerCupsHolder = new TransformNode("opBeerCupsHolder", this._scene);
        //const opBeerCupsHolder = MeshBuilder.CreateBox("opBeerCupHolder", {size: 0},this._scene);
        for (let i = 0; i < 10; i++) {
            let beerCupInstance = this._assets.beerCup.clone("opBeerCup " + i);
            beerCupInstance.isVisible = true;
            
            const beerCupCollider = MeshBuilder.CreateCylinder(beerCupInstance.name + "collider", { height: 0.6, diameterTop: 0.5, diameterBottom:0.3 }, this._scene);
            beerCupCollider.isVisible = true;
            beerCupCollider.bakeTransformIntoVertices(Matrix.Translation(0, 0.3, 0));
            
            beerCupInstance.setParent(beerCupCollider);
            beerCupCollider.setParent(opBeerCupsHolder);

            beerCupCollider.physicsImpostor = new PhysicsImpostor(
                beerCupCollider,
                PhysicsImpostor.CylinderImpostor,
                {mass: 0, restitution: 0}
            );
            

            //Create the new beerCup object
            
            let newOpBeerCup = new BeerCup(
                this._materials.blueCupMat,
                beerCupCollider,
                beerCupInstance,
                this._scene,
                cupsPositions[i]
            );
            
            this._opBeerCupObjs.push(newOpBeerCup);
        }
        opBeerCupsHolder.position = positionOffset;
        //opBeerCupsHolder.isVisible = false;
        //opBeerCupsHolder.physicsImpostor = new PhysicsImpostor(opBeerCupsHolder, PhysicsImpostor.NoImpostor, {mass: 0},this._scene);


        // player's beer cups
        const plBeerCupsHolder = new TransformNode("plBeerCupsHolder", this._scene);
        for (let i = 0; i < 10; i++) {
            let beerCupInstance = this._assets.beerCup.clone("plBeerCup " + i);
            beerCupInstance.isVisible = true;

            const beerCupCollider = MeshBuilder.CreateCylinder(beerCupInstance.name + "collider", { height: 0.8, diameterTop: 0.7, diameterBottom:0.45 }, this._scene);
            beerCupCollider.isVisible = false;
            beerCupCollider.bakeTransformIntoVertices(Matrix.Translation(0, 0.4, 0));
            
            beerCupInstance.setParent(beerCupCollider);
            beerCupCollider.setParent(plBeerCupsHolder);
            
            beerCupCollider.physicsImpostor = new PhysicsImpostor(
                beerCupCollider, 
                PhysicsImpostor.CylinderImpostor,
                {mass: 0.2, restitution: 0.2}
            );

            let plCupPosition = cupsPositions[i];
            plCupPosition.z = -cupsPositions[i].z

            let newPlBeerCup = new BeerCup(
                this._materials.redCupMat,
                beerCupCollider,
                beerCupInstance,
                this._scene,
                plCupPosition
            );
            this._opBeerCupObjs.push(newPlBeerCup);
        }
        plBeerCupsHolder.position = new Vector3(0, 4.15, 4.5);


        this._assets.beerCup.dispose();
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
    
    private async _loadMaterials(){
        
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
        
        return{
            blueCupMat : blueCupMat as PBRMetallicRoughnessMaterial,
            redCupMat : redCupMat as PBRMetallicRoughnessMaterial, 
            tableMat : tableMat as PBRMetallicRoughnessMaterial
        }
        
        
    }

    private _createImpostors(): void {

        const tableCollider = MeshBuilder.CreateBox("tableCollider", {depth: 14.35, width: 3.65, height: 4.125});

        tableCollider.bakeTransformIntoVertices(Matrix.Translation(0, 1, 0));
        tableCollider.isVisible = false;
        tableCollider.isPickable = false;
        tableCollider.checkCollisions = true;

        this._assets.table.parent = tableCollider;

        tableCollider.physicsImpostor = new PhysicsImpostor(
            tableCollider,
            PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 0.8}
        );
        
        this._opBeerCupObjs.forEach(cup =>{
            cup.beerCupCollider.checkCollisions = true;
            cup.beerCupCollider.physicsImpostor = new PhysicsImpostor(
                cup.beerCupCollider, 
                PhysicsImpostor.CylinderImpostor,
                {mass: 0.1, restitution: 0}
            )
        })
        

    }
    
    
    private _loadBeerCups(name: string, mesh:Mesh, material: PBRMetallicRoughnessMaterial, positionOffset: Vector3){

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

        const positionMultiplier = new Vector3(1.6, 1, 2.8);
                
        for (let i = 0; i < 10; i++) {
            
            // create clone from the beercup mesh
            const beerCupInstance = mesh.clone(name + i);
            beerCupInstance.isVisible = true;
            beerCupInstance.material = material;
            beerCupInstance.position = Vector3.Zero();

            // create collider mesh
            const beerCupCollider = MeshBuilder.CreateCylinder(beerCupInstance.name + "_root", { height: 0.6, diameterTop: 0.5, diameterBottom:0.3 }, this._scene);
            beerCupCollider.isVisible = false;
            beerCupCollider.bakeTransformIntoVertices(Matrix.Translation(0, 0.3, 0));
            
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
                {mass: 0, restitution: 0}
            );
        }
    }
}