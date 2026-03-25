import { Schema, MapSchema, type } from '@colyseus/schema';
import { PlayerState } from './PlayerState.js';
import { NPCEntity } from './NPCEntity.js';

export class HubState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: NPCEntity }) npcs = new MapSchema<NPCEntity>();
}
