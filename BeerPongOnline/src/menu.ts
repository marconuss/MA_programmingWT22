import {Engine, FreeCamera, Scene, Vector3} from "@babylonjs/core";
import {AdvancedDynamicTexture, Button} from "@babylonjs/gui";
import {Client} from "colyseus.js";
import Game from "./game";

const ROOM_NAME = "pub";
const ENDPOINT = "ws://localhost:2567";

export default class Menu {
    private _scene: Scene;
    private _engine: Engine;
    private _advancedTexture: AdvancedDynamicTexture;

    private _colyseus;

    constructor(scene: Scene, engine: Engine) {
        this._scene = scene;
        this._engine = engine;

        this._colyseus = new Client(ENDPOINT);
    }

    public async createMenu() {

        //await this._connectToServer();

        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._scene);
        camera.setTarget(Vector3.Zero());

        const createGameBtn = Button.CreateSimpleButton("createGame", "START NEW GAME");
        createGameBtn.width = 0.2;
        createGameBtn.height = "40px";
        createGameBtn.top = "-50px";
        createGameBtn.color = "white";
        this._advancedTexture.addControl(createGameBtn);

        createGameBtn.onPointerUpObservable.add(() => {
            this._createGame("create");
        });

        const joinGameBtn = Button.CreateSimpleButton("joinGame", "JOIN GAME");
        joinGameBtn.width = 0.2;
        joinGameBtn.height = "40px";
        joinGameBtn.color = "white";
        this._advancedTexture.addControl(joinGameBtn);

        joinGameBtn.onPointerUpObservable.add(() => {
            this._createGame("join");
        });

    }

    private async _createGame(method: string): Promise<void> {
        let game: Game;
        game = new Game(this._scene, this._engine);
        this._scene.dispose();
        await game.init(method);

    }
}