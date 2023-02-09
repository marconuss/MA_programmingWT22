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

        const mainBtn = Button.CreateSimpleButton("mainmenu", "START GAME");
        mainBtn.width = 0.2;
        mainBtn.height = "40px";
        mainBtn.color = "white";
        this._advancedTexture.addControl(mainBtn);
        //this handles interactions with the start button attached to the scene
        mainBtn.onPointerUpObservable.add(() => {
            this._createGame();
        });
        
    }
    
    private async _createGame(): Promise<void>{
        let game: Game;
    }
    
}