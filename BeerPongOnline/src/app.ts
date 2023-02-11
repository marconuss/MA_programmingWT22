import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {CannonJSPlugin, Color4, Engine, Scene,} from "@babylonjs/core";
import * as CANNON from "cannon";
import Menu from "./menu";

class App {


    private _canvas: HTMLCanvasElement;
    private _scene: Scene;
    private readonly _engine: Engine;

    private _physicsEngine;

    constructor() {
        this._canvas = this._createCanvas();

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        // initialize physics engine
        this._physicsEngine = new CannonJSPlugin(true, 10, CANNON);

        // run the main render loop
        this._main();
    }

    private _createCanvas(): HTMLCanvasElement {

        const renderContainer = document.getElementById("app");

        //create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.id = "gameCanvas";
        renderContainer.appendChild(this._canvas);

        return this._canvas;
    }


    private async _main(): Promise<void> {

        //start from the menu scene
        await this._goToMenu();

        // Register a render loop to repeatedly render the scene
        this._engine.runRenderLoop(() => {
            this._scene.render();

        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private async _goToMenu() {

        this._engine.displayLoadingUI();
        this._scene.detachControl();

        console.log("load menu scene");
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);

        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;

        const menu = new Menu(this._scene, this._engine);

        await menu.createMenu();
    }


}

new App();