import {
    Vector3,
    SceneLoader,
    AssetContainer
} from "@babylonjs/core";
import "@babylonjs/loaders";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";


export class BeerCups {
    async CreateBeerCups(): Promise<void> {


        const duplicate = (container: AssetContainer, cupPosition: Vector3) => {
            const entries = container.instantiateModelsToScene();

            let beerContainer = null;
            for (const node of entries.rootNodes) {
                node.position = cupPosition;
                node.scaling = new Vector3(0.1, 0.1, 0.1);
                beerContainer = node;
            }
            return beerContainer;
        }

        //load beerCup asset
        const beerCupContainer = await SceneLoader.LoadAssetContainerAsync(
            "./assets/meshes/",
            "BeerCup.glb");

        beerCupContainer.addAllToScene();

        const cupsPositions: Vector3[] = [
            new Vector3(0, 0, 0),
            new Vector3(0.25, 0, 0.25),
            new Vector3(-0.25, 0, 0.25),
            new Vector3(0.5, 0, 0.5),
            new Vector3(0, 0, 0.5),
            new Vector3(-0.5, 0, 0.5),
            new Vector3(0.75, 0, 0.75),
            new Vector3(0.25, 0, 0.75),
            new Vector3(-0.25, 0, 0.75),
            new Vector3(-0.75, 0, 0.75)
        ];

        const multiplierX = 1;
        const multiplierZ = 1.8;

        const beerCups = [];

        for (let i = 0; i < cupsPositions.length; i++) {
            const beerCup = duplicate(
                beerCupContainer,
                cupsPositions[i].multiply(new Vector3(multiplierX, 0, multiplierZ))
            );
            beerCups.push(beerCup);

            //add physics impostor here
        }


        beerCupContainer.removeFromScene();

    }

}