import { TransformNode, ShadowGenerator, Scene, Mesh, UniversalCamera, ArcRotateCamera, Vector3 } from "@babylonjs/core";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;
    private _input;

    //Player
    public mesh: Mesh; //outer collisionbox of player

    //constant values
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.7, 0, 0);

    constructor(assets, scene: Scene, /*shadowGenerator: ShadowGenerator,*/ input?) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        //shadowGenerator.addShadowCaster(assets.mesh); //the player mesh will cast shadows

        this._input = input; //inputs we will get from inputController.ts
    }

    private _setupPlayerCamera() {
        
        //our actual camera that's pointing at our root's position
        this.camera = new UniversalCamera("cam", new Vector3(0, 8, 10), this.scene);
        //this.camera.lockedTarget = this._camRoot.position;
        this.camera.rotation = new Vector3(0.3, Math.PI, 0);
        this.camera.attachControl();
        this.camera.fov = 0.5

        this.scene.activeCamera = this.camera;
        return this.camera;
    }
}