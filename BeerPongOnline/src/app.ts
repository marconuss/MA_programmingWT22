import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
    CannonJSPlugin,
    Color4,
    Engine,
    FreeCamera,
    HemisphericLight,
    Scene,
    Vector3
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Slider
} from "@babylonjs/gui";
import {Environment} from "./environment";
import {Player} from "./player";
import * as CANNON from "cannon";

enum State { START = 0, GAME = 1, LOSE = 2 }

class App {
    //Game State Related
    public assets;
    // General Entire Application
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private readonly _engine: Engine;
    private _environment;
    private _player: Player;

    private _physicsEngine;

    //Scene - related
    private _state: State = 0;
    private _gamescene: Scene;

    constructor() {
        this._canvas = this._createCanvas();

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        this._physicsEngine = new CannonJSPlugin(true, 10, CANNON);

        // hide/show the Inspector
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

        // run the main render loop
        this._main();
    }

    private _createCanvas(): HTMLCanvasElement {

        //Commented out for development
        // document.documentElement.style["overflow"] = "hidden";
        // document.documentElement.style.overflow = "hidden";
        // document.documentElement.style.width = "100%";
        // document.documentElement.style.height = "100%";
        // document.documentElement.style.margin = "0";
        // document.documentElement.style.padding = "0";
        // document.body.style.overflow = "hidden";
        // document.body.style.width = "100%";
        // document.body.style.height = "100%";
        // document.body.style.margin = "0";
        // document.body.style.padding = "0";

        const renderContainer = document.getElementById("app");

        //create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.id = "gameCanvas";
        renderContainer.appendChild(this._canvas);

        return this._canvas;
    }

    private async _main(): Promise<void> {
        await this._goToStart();

        // Register a render loop to repeatedly render the scene
        this._engine.runRenderLoop(() => {
            switch (this._state) {
                case State.START:
                    this._scene.render();
                    break;
                case State.GAME:
                    this._scene.render();
                    break;
                case State.LOSE:
                    this._scene.render();
                    break;
                default:
                    break;
            }
        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private async _goToStart() {
        this._engine.displayLoadingUI();

        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //create a fullscreen ui for all of our GUI elements
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720; //fit our fullscreen ui to this height

        //create a simple button
        const startBtn = Button.CreateSimpleButton("start", "PLAY");
        startBtn.width = 0.2
        startBtn.height = "40px";
        startBtn.color = "white";
        startBtn.top = "-50px";
        startBtn.thickness = 0;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiMenu.addControl(startBtn);

        //this handles interactions with the start button attached to the scene
        startBtn.onPointerDownObservable.add(() => {
            this._goToGame();
            scene.detachControl(); //observables disabled
        });

        let finishedLoading = false;
        await this._setUpGame().then(() => {
            finishedLoading = true;
        });

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;
    }

    private async _setUpGame() {
        let scene = new Scene(this._engine);
        this._gamescene = scene;

        scene.enablePhysics(new Vector3(0, -9.81, 0), this._physicsEngine);

        // create environment
        const environment = new Environment(scene);
        this._environment = environment;
        await this._environment.load();

        // create player

        //Create the player
        this._player = new Player(scene);
        await this._player.loadPlayerAssets(scene);

        this._environment._createImpostors();
    }


    private async _initializeGameAsync(scene): Promise<void> {
        //temporary light to light the entire scene
        const light0 = new HemisphericLight("HemiLight", new Vector3(1, 1, 0), scene);

    }

    private async _goToGame() {
        //--SETUP SCENE--
        this._scene.detachControl();
        let scene = this._gamescene;
        scene.clearColor = new Color4(0.02, 0.02, 0.2);

        //--GUI--
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        //dont detect any inputs from this ui while the game is loading
        scene.detachControl();

        //create a simple button
        const loseBtn = Button.CreateSimpleButton("lose", "MENU");
        loseBtn.width = 0.2
        loseBtn.height = "40px";
        loseBtn.color = "white";
        loseBtn.top = "-14px";
        loseBtn.thickness = 0;
        loseBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        loseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        playerUI.addControl(loseBtn);

        const shootBtn = Button.CreateSimpleButton("lose", "SHOOT");
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

        //this handles interactions with the start button attached to the scene
        loseBtn.onPointerDownObservable.add(() => {

            this._goToLose();
            scene.detachControl(); //observables disabled
        });

        shootBtn.onPointerDownObservable.add(() => {

            this._player._shootBall(new Vector3(direction, 1, strength));
        });

        //primitive character and setting
        await this._initializeGameAsync(scene);

        //--WHEN SCENE FINISHED LOADING--
        await scene.whenReadyAsync();

        //get rid of start scene, switch to gamescene and change states
        this._scene.dispose();
        this._state = State.GAME;
        this._scene = scene;
        this._engine.hideLoadingUI();
        //the game is ready, attach control back
        this._scene.attachControl();
    }

    private async _goToLose(): Promise<void> {
        this._engine.displayLoadingUI();

        //--SCENE SETUP--
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //--GUI--
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const mainBtn = Button.CreateSimpleButton("mainmenu", "MAIN MENU");
        mainBtn.width = 0.2;
        mainBtn.height = "40px";
        mainBtn.color = "white";
        guiMenu.addControl(mainBtn);
        //this handles interactions with the start button attached to the scene
        mainBtn.onPointerUpObservable.add(() => {
            this._goToStart();
        });

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI(); //when the scene is ready, hide loading
        //lastly set the current state to the lose state and set the scene to the lose scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.LOSE;
    }

}

new App();