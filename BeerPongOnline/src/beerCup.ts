import {AnimationGroup, Mesh, PBRMetallicRoughnessMaterial, Scene, Vector3} from "@babylonjs/core";

export class BeerCup {

    public _scene: Scene;

    public mesh: Mesh;
    private _colormtl: PBRMetallicRoughnessMaterial;

    constructor(colormtl: PBRMetallicRoughnessMaterial, mesh: Mesh, scene: Scene, position: Vector3) {
        this._scene = scene;
        this._colormtl = colormtl;

        this._loadBeerCups(mesh, position);

    }

    private _loadBeerCups(mesh: Mesh, position: Vector3) {
        this.mesh = mesh;
        this.mesh.scaling = new Vector3(.16, .16, .16);
        
        const multiplier = new Vector3(1.6, 1, 2.8);
        
        //const offset = new Vector3(0, 3.15, -4);
        const offset = new Vector3(0, 0, 0);
        
        position = new Vector3(
            position.x * multiplier.x + offset.x,
            position.y * multiplier.y + offset.y, 
            position.z * multiplier.z + offset.z           
        )

        this.mesh.setAbsolutePosition(position);
        this.mesh.isPickable = false;
    }
}