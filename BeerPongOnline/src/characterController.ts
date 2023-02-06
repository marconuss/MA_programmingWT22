﻿import { TransformNode, ShadowGenerator, Scene, Mesh, UniversalCamera, ArcRotateCamera, Vector3 } from "@babylonjs/core";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;
    private _input;

    //camera
    private _camRoot: TransformNode;
    private _yTilt: TransformNode;

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
        //root camera parent that handles positioning of the camera to follow the player
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 1, 0); //initialized at (0,0,0)
        //to face the player from behind (180 degrees)
        this._camRoot.rotation = new Vector3(0, Math.PI, 0);

        //rotations along the x-axis (up/down tilting)
        let yTilt = new TransformNode("ytilt");
        //adjustments to camera view to point down at our player
        yTilt.rotation = Player.ORIGINAL_TILT;
        this._yTilt = yTilt;
        yTilt.parent = this._camRoot;

        //our actual camera that's pointing at our root's position
        this.camera = new UniversalCamera("cam", new Vector3(0, 0, -10), this.scene);
        //this.camera.lockedTarget = this._camRoot.position;
        this.camera.attachControl();
        this.camera.fov = 0.58;
        this.camera.parent = yTilt;

        this.scene.activeCamera = this.camera;
        return this.camera;
    }
}