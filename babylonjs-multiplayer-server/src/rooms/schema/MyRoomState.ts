import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") currentTurn: number; // 0 for player 1, 1 for player 2
  @type("number") direction: number;
  @type("number") strength: number;
}

export class MyRoomState extends Schema {
  @type({map: Player}) players = new MapSchema<Player>();
}
