import {
    Color3,
    Mesh,
    MeshBuilder,
    PhysicsImpostor,
    Scene,
    StandardMaterial,
    UniversalCamera,
    Vector3
} from "@babylonjs/core";

export class Player {

    //constant values
    public camera;
    public scene: Scene;

    //Player
    public playerMesh: Mesh;
    public playerCollider: Mesh;

    //public player: TransformNode;

    constructor(scene: Scene) {
        this.scene = scene;
        //this._setupPlayerCamera();
        //this.player = new TransformNode("player", this.scene);
    }

    public async loadPlayerAssets(scene) {

        this.playerCollider = MeshBuilder.CreateSphere("playerCollider", {diameter: 0.3, segments: 16}, scene);
        this.playerCollider.isVisible = false;
        this.playerCollider.isPickable = false;
        this.playerCollider.checkCollisions = true;

        this.playerMesh = MeshBuilder.CreateSphere("ball", {diameter: 0.3, segments: 16}, scene);
        const ballMtl = new StandardMaterial("white", scene);
        ballMtl.diffuseColor = new Color3(.9, .9, .9);
        this.playerMesh.material = ballMtl;
        this.playerMesh.isPickable = false;

        this.playerMesh.parent = this.playerCollider;
        this.playerCollider.parent = null;
        //this.playerCollider.parent = this.player;
                
        return this.playerCollider;
        
    }

    public _shootBall(forceVector: Vector3) {

        //Apply an impulse to the ball in the given direction
        this.playerCollider.physicsImpostor = new PhysicsImpostor(
            this.playerCollider,
            PhysicsImpostor.SphereImpostor,
            {mass: 0.3, restitution: 1},
        );

        this.playerCollider.physicsImpostor.applyImpulse(forceVector, this.playerCollider.position);

    }

    private _setupPlayerCamera() {

        //our actual camera that's pointing at our root's position
        this.camera = new UniversalCamera("cam", new Vector3(0, 8.5, 11), this.scene);
        //this.camera.lockedTarget = this._camRoot.position;
        this.camera.rotation = new Vector3(0.35, Math.PI, 0);
        this.camera.attachControl();
        this.camera.fov = 0.7

        this.scene.activeCamera = this.camera;
        return this.camera;
    }

}