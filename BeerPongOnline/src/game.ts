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
import Menu from "./menu";
import {Environment} from "./environment";
import {AdvancedDynamicTexture, Button, Control, Slider} from "@babylonjs/gui";
import {Player} from "./player";
import CANNON from "cannon";
import {Client, Room} from "colyseus.js";

const CAMERA_ROTATION = 0.35;
const ROOM_NAME = "pub";
const ENDPOINT = "ws://localhost:2567";

enum Team { RED = 0, BLUE = 1}

export default class Game {

    public localTeam: Team;

    private _scene: Scene;
    private _engine: Engine;
    private _physicsEngine: CannonJSPlugin;


    private _room: Room;
    private _playerEntities: { [playerId: string]: Mesh } = {};
    private _playerStrength: { [playerId: string]: number } = {};
    private _playerDirection: { [playerId: string]: number } = {};

    private _player: Player;
    private _camera: UniversalCamera;

    private _colyseus;

    //constructor(scene: Scene, engine: Engine, room: Room) {
    constructor(scene: Scene, engine: Engine) {
        this._engine = engine;
        this._scene = scene;
        //this._room = room;

        this._colyseus = new Client(ENDPOINT);

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

    public async init(method: string) {
        try {
            switch (method) {
                case "create":
                    this._room = await this._colyseus.joinOrCreate(ROOM_NAME);
                    this.localTeam = Team.RED;
                    await this._onAddPlayers();
                    break;
                case "join":
                    this._room = await this._colyseus.join(ROOM_NAME);
                    this.localTeam = Team.BLUE;
                    await this._onAddPlayers();
                    break;
                default:
                    console.log("default in game init");
                    break;
            }
            await this.initGame();
        } catch (error) {
            console.error("!error! " + error.message);
        }
    }

    public async initGame() {

        let scene = new Scene(this._engine);
        this._scene = scene;
        scene.gravity = new Vector3(0, -9.81, 0);
        scene.enablePhysics(scene.gravity, this._physicsEngine);

        await this._setupCamera();

        await this.initEnvironment();

        this._displayGameControls();

        this.doRender();
    }

    public async initPlayers() {

        console.log("initPLAYER");
        /*
        
        const playerId = this._room.sessionId;
        console.log("local player id: ", playerId);
        this._colyseus.then(function (room){
            console.log("created room:", room.name);
            return room;
        });
                
        this._player = new Player(this._scene);
        await this._player.loadPlayerAssets(this._scene);
        
        this._room.state.players.onAdd = (player, key) =>{
            console.log("added player: ", player);
            console.log("with key: ", key)
        };
            
         */

    }

    private async _onAddPlayers() {
        this._room.state.players.onAdd = (player, key) => {
            const isCurrentPlayer = (key === this._room.sessionId);

            if (isCurrentPlayer) {
                console.log("room: ", this._room.id);
                console.log("this player: ", key);
                console.log("current turn: ", player.currentTurn);
                if (this.localTeam == player.currentTurn) {
                    console.log("turn: ", this.localTeam);
                }
            }
        };
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
        let cameraPos = new Vector3(0, 8.5, 11);
        let cameraRot = new Vector3(CAMERA_ROTATION, Math.PI, 0);
        if(this.localTeam === Team.BLUE){
            cameraPos = new Vector3(0, 8.5, -11);
            cameraRot = new Vector3(CAMERA_ROTATION, 0, 0);
        }

        this._camera = new UniversalCamera("cam", cameraPos, this._scene);
        //this.camera.lockedTarget = this._camRoot.position;
        this._camera.rotation = cameraRot;
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

    public sendForceVector(force: Vector3) {
        this._room.send('strength', force.z);
        this._room.send('direction', force.x);
    }

    public endTurn(currentTurn: number) {
        // player 1 plays at turn 0
        // player 2 plays at turn 1

        this._room.send(currentTurn === 0 ? 1 : 0);
    }


}