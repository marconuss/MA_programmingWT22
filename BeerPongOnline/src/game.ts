import {
    CannonJSPlugin,
    Color3,
    Engine,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    UniversalCamera,
    Vector3
} from "@babylonjs/core";
import {Room} from "colyseus.js";
import Menu from "./menu";
import {Environment} from "./environment";
import {AdvancedDynamicTexture, Button, Control, Slider} from "@babylonjs/gui";
import {Player} from "./player";
import CANNON from "cannon";

const CAMERA_ROTATION = 0.35;

export default class Game {

    private _scene: Scene;
    private _engine: Engine;
    private _physicsEngine: CannonJSPlugin;

    private _room: Room;
    private _playerEntities: { [playerId: string]: Mesh } = {};
    private _playerStrength: { [playerId: string]: number } = {};
    private _playerDirection: { [playerId: string]: number } = {};

    private _player: Player;
    private _camera: UniversalCamera;
    
    constructor(scene: Scene, engine: Engine, room: Room) {
        this._engine = engine;
        this._scene = scene;
        this._room = room;

        this._physicsEngine = new CannonJSPlugin(true, 10, CANNON);
        
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.key === "i") {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });
    }
    
    public async initGame() {
        
        console.log("joined room: " + this._room.name);
        
        let scene = new Scene(this._engine);
        this._scene = scene;
        scene.gravity = new Vector3(0, -9.81, 0);
        scene.enablePhysics(scene.gravity, this._physicsEngine);
        
        await this._setupCamera();
        
        await this.initEnvironment();
        
        await this.initPlayers();
        
        this._displayGameControls();
        
        this.doRender();
    }

    public async initPlayers() {
        
        this._player = new Player(this._scene);
        //await this._player.loadPlayerAssets(this._scene);
        
        this._room.state.players.onAdd = (player, sessionId) => {
                        
            const playerCollider = MeshBuilder.CreateSphere("playerCollider", {diameter: 0.3, segments: 16}, this._scene);
            playerCollider.isVisible = false;
            playerCollider.isPickable = false;
            playerCollider.checkCollisions = true;

            const playerMesh = MeshBuilder.CreateSphere("ball", {diameter: 0.3, segments: 16}, this._scene);
            const ballMtl = new StandardMaterial("white", this._scene);
            ballMtl.diffuseColor = new Color3(.9, .9, .9);
            playerMesh.material = ballMtl;
            playerMesh.isPickable = false;

            playerMesh.parent = playerCollider;
            playerCollider.parent = null;

            //playerCollider.position = isCurrentPlayer ? playerCollider.position.set(0, 7, 6.5) : playerCollider.position.set(0, 7, -6.5);

            if (this._room.state.players.length === 0) {
                // First player to join
                playerCollider.position = playerCollider.position.set(0, 7, -6.5);
                this._camera.position = new Vector3(0, 8.5, -11);
                
            } else {
                // Second player to join
                playerCollider.position = playerCollider.position.set(0, 7, 6.5);
                this._camera.position = new Vector3(0, 8.5, 11);
                this._camera.rotation.addInPlace(new Vector3(0, -3.1, 0));
            }
            
            this._playerStrength[sessionId] = player.strength;
            this._playerDirection[sessionId] = player.direction;
            
            player.onChange(() => {
                this._playerStrength[sessionId] = player.strength;
                this._playerDirection[sessionId] = player.direction;
            });
        };
        
        this._room.onLeave(() => {
            //this._goToMenu();
        });
    }
    
    public async initEnvironment() {

        const environment = new Environment(this._scene);
        await environment.load();
        
    }
    
    public _displayGameControls() {
        
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("GameUI");

        const shootBtn = Button.CreateSimpleButton("shoot", "SHOOT");
        shootBtn.width = 0.2
        shootBtn.height = "40px";
        shootBtn.color = "white";
        shootBtn.top = "-14px";
        shootBtn.background = "green";
        shootBtn.thickness = 0;
        shootBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        playerUI.addControl(shootBtn);

        const directionSlider = new Slider();
        directionSlider.minimum = -0.5;
        directionSlider.maximum = 0.5;
        directionSlider.value = 0;
        directionSlider.height = "20px";
        directionSlider.width = "150px";
        directionSlider.color = "#003399";
        directionSlider.background = "grey";
        directionSlider.left = "120px";
        directionSlider.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        directionSlider.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        playerUI.addControl(directionSlider);

        const strenghtSlider = new Slider();
        strenghtSlider.minimum = 1;
        strenghtSlider.maximum = 5;
        strenghtSlider.value = 1;
        strenghtSlider.height = "20px";
        strenghtSlider.width = "150px";
        strenghtSlider.color = "#003399";
        strenghtSlider.background = "grey";
        strenghtSlider.left = "120px";
        strenghtSlider.top = "50px";
        strenghtSlider.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        strenghtSlider.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        playerUI.addControl(strenghtSlider);

        let direction = directionSlider.value;
        let strength = -strenghtSlider.value;
        directionSlider.onValueChangedObservable.add(updateForce);

        strenghtSlider.onValueChangedObservable.add(updateForce);

        function updateForce() {
            direction = directionSlider.value;
            strength = -strenghtSlider.value;
        }
        
        shootBtn.onPointerDownObservable.add(() => {

            this._player._shootBall(new Vector3(direction, 1, strength));

            this._room.send("message", {
                direction: direction,
                strength: strength
            })
        });        
    }

/*
    
    private _goToMenu() {

        this._engine.displayLoadingUI();
        this._scene.detachControl();

        this._scene.dispose();
        
        const menu = new Menu(this._engine);
        menu.createMenu();
    }
 */
    
    private _setupCamera() {

        //our actual camera that's pointing at our root's position
        this._camera = new UniversalCamera("cam", new Vector3(0, 8.5, 11), this._scene);
        //this.camera.lockedTarget = this._camRoot.position;
        this._camera.rotation = new Vector3(CAMERA_ROTATION, Math.PI, 0);
        this._camera.attachControl();
        this._camera.fov = 0.7

        this._scene.activeCamera = this._camera;
        return this._camera;
    }


    private doRender(): void {

        // Run the render loop.
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
    
}