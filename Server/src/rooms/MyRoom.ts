import {Client, Room} from "colyseus";
import {MyRoomState, Player} from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {

    maxClients = 2;

    onCreate(options: any) {
        this.setState(new MyRoomState());

        this.onMessage("message", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            player.currentTurn = data.currentTurn;
            player.strength = data.strength;
            player.direction = data.direction;
        });

    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");

        const player = new Player();
        player.strength = 1;
        player.direction = 0;
        player.currentTurn = 0;

        this.state.players.set(client.sessionId, player);

    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");

        this.state.players.delete(client.sessionId);
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

}
