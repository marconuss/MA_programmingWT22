import {Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3} from "@babylonjs/core";
import {Room} from "colyseus.js";
import Menu from "./menu";
import {Environment} from "./environment";


export default class Game {

    private _scene: Scene;

    private _room: Room;
    private _playerEntities: { [playerId: string]: Mesh } = {};
    private _playerStrength: { [playerId: string]: number } = {};
    private _playerDirection: { [playerId: string]: number } = {};

    constructor(scene: Scene, room: Room) {
        this._scene = scene;
        this._room = room;
    }

    initPlayers(): void {
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
        })
    }
    
    
    private async initEnvironment() {

        const environment = new Environment(this._scene);
        await environment.load();
        
    }
    
    private _goToMenu() {
        const menu = new Menu(this._scene);
        menu.createMenu();
    }
    
}