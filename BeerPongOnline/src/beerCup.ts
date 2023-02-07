import {
    AnimationGroup,
    Material,
    Mesh, PBRMaterial,
    PBRMetallicRoughnessMaterial,
    Scene,
    StandardMaterial,
    Vector3
} from "@babylonjs/core";

export class BeerCup {

    public _scene: Scene;

    public mesh: Mesh;
    private _colormtl: PBRMetallicRoughnessMaterial;

    constructor(colormtl: PBRMetallicRoughnessMaterial, mesh: Mesh, scene: Scene, position: Vector3) {
        this._scene = scene;
        this._colormtl = colormtl;

        mesh.material = this._colormtl;

        this._loadBeerCups(mesh, position);

    }

    private _loadBeerCups(mesh: Mesh, position: Vector3) {
        this.mesh = mesh;
        this.mesh.scaling.scaleInPlace(7.8);

        const multiplier = new Vector3(1.6, 1, 2.8);

        position = new Vector3(
            position.x * multiplier.x,
            position.y * multiplier.y,
            position.z * multiplier.z
        )

        this.mesh.setAbsolutePosition(position);
        this.mesh.isPickable = false;
    }
}