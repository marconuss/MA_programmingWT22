import {
    Color3, 
    Mesh, 
    MeshBuilder, 
    PhysicsImpostor, 
    Scene, 
    StandardMaterial, 
    Vector3
} from "@babylonjs/core";

export class Player {
    
    public playerMesh: Mesh;
    public playerCollider: Mesh;
    private _scene: Scene;



    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async loadPlayerAssets() {

        this.playerCollider = MeshBuilder.CreateSphere("playerCollider", {diameter: 0.3, segments: 16}, this._scene);
        this.playerCollider.isVisible = false;
        this.playerCollider.isPickable = false;
        this.playerCollider.checkCollisions = true;

        this.playerMesh = MeshBuilder.CreateSphere("ball", {diameter: 0.3, segments: 16}, this._scene);
        const ballMtl = new StandardMaterial("white", this._scene);
        ballMtl.diffuseColor = new Color3(.9, .9, .9);
        this.playerMesh.material = ballMtl;
        this.playerMesh.isPickable = false;

        this.playerMesh.parent = this.playerCollider;
        this.playerCollider.parent = null;
        this.playerCollider.position.set(0, 7, 6.5);
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

}