import {Mesh, PBRMetallicRoughnessMaterial, Scene, Vector3} from "@babylonjs/core";

export class BeerCup {

    public _scene: Scene;

    public beerCupMesh: Mesh;
    public beerCupCollider: Mesh;

    private _colormtl: PBRMetallicRoughnessMaterial;

    constructor(colormtl: PBRMetallicRoughnessMaterial, collider: Mesh, mesh: Mesh, scene: Scene, position: Vector3) {
        this._scene = scene;
        this._colormtl = colormtl;

        mesh.material = colormtl;

        this._loadBeerCups(collider, mesh, position);


    }

    private _loadBeerCups(collider: Mesh, mesh: Mesh, position: Vector3) {
        this.beerCupCollider = collider;
        this.beerCupMesh = mesh;

        this.beerCupMesh.scaling.scaleInPlace(7.8);

        const multiplier = new Vector3(1.6, 1, 2.8);

        position = new Vector3(
            position.x * multiplier.x,
            position.y * multiplier.y,
            position.z * multiplier.z
        )

        this.beerCupMesh.isPickable = false;

        this.beerCupCollider.setAbsolutePosition(position);
    }
}