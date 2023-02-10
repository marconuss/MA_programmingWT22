import {Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3} from "@babylonjs/core";
import {Room} from "colyseus.js";
import Menu from "./menu";
import {Environment} from "./environment";
import {AdvancedDynamicTexture, Button, Control, Slider} from "@babylonjs/gui";
import {Player} from "./player";


export default class Game {

    private _scene: Scene;

    private _room: Room;
    private _playerEntities: { [playerId: string]: Mesh } = {};
    private _playerStrength: { [playerId: string]: number } = {};
    private _playerDirection: { [playerId: string]: number } = {};

    private _player: Player;
    constructor(scene: Scene, room: Room) {
        this._scene = scene;
        this._room = room;
    }

    public initPlayers(): void {
        
        this._player = new Player(this._scene);
        
        this._room.state.players.onAdd((player, sessionId) => {

            const isCurrentPlayer = (sessionId === this._room.sessionId);

            const sphere = MeshBuilder.CreateSphere(`player-${sessionId}`, {
                segments: 16,
                diameter: 0.3
            }, this._scene);

            const sphereMat = new StandardMaterial(`playerMat-${sessionId}`, this._scene);
            sphereMat.diffuseColor = new Color3(.9, .9, .9);
            sphere.material = sphereMat;

            sphere.position = isCurrentPlayer ? sphere.position.set(0, 7, 6.5) : sphere.position.set(0, 7, -6.5);
            
            this._player.playerMesh = sphere;

            this._playerEntities[sessionId] = sphere;
            this._playerStrength[sessionId] = player.strength;
            this._playerStrength[sessionId] = player.strength;
            
            player.onChange(() => {
                this._playerStrength[sessionId] = player.strength;
                this._playerStrength[sessionId] = player.strength;
            });
        });
        
        this._room.onLeave(() => {
            this._goToMenu();
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
    
    private _goToMenu() {
        const menu = new Menu(this._scene);
        menu.createMenu();
    }
    
}