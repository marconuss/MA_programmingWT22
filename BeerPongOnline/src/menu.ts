import {Scene} from "@babylonjs/core";
import {AdvancedDynamicTexture, Button} from "@babylonjs/gui";
import {Client} from "colyseus.js";
import Game from "./game";

const ROOM_NAME = "Pub";
const ENDPOINT = "ws://localhost/2567";

export default class Menu{
    private _scene: Scene;
    private _advancedTexture: AdvancedDynamicTexture;
    
    private _colyseus: Client = new Client(ENDPOINT);
    
    constructor(scene: Scene) {
        this._scene = scene;
    }
    
    public createMenu() : void{
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        const createGameBtn = Button.CreateSimpleButton("createGame", "START NEW GAME");
        createGameBtn.width = 0.2;
        createGameBtn.height = "40px";
        createGameBtn.color = "white";
        this._advancedTexture.addControl(createGameBtn);
        
        createGameBtn.onPointerUpObservable.add(() => {
            this._createGame("create");
        });
        
        const joinGameBtn = Button.CreateSimpleButton("joinGame", "JOIN GAME");
        joinGameBtn.width = 0.2;
        joinGameBtn.height = "40px";
        joinGameBtn.top = "-50px";
        joinGameBtn.color = "white";
        this._advancedTexture.addControl(joinGameBtn);

        joinGameBtn.onPointerUpObservable.add(() => {
            this._createGame("join");
        });
                
    }
    
    private async _createGame(method: string): Promise<void>{
        let game: Game;
        try{
            switch (method) {
                case "create":
                    game = new Game(this._scene, await this._colyseus.create(ROOM_NAME));
                    break;
                case "join":
                    game = new Game(this._scene, await this._colyseus.join(ROOM_NAME));
                    break;
                default:
                    game = new Game(this._scene, await this._colyseus.joinOrCreate(ROOM_NAME));
            }
            this._scene.dispose(); 
            await this._goToGame();
        } catch (error) {
            console.log("!!" + error);
        }
        
    }
    
    private async _goToGame(){
        
    }
    
}