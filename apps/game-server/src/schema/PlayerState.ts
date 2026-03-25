import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
  @type('string') userId = '';
  @type('string') displayName = '';
  @type('number') x = 0;
  @type('number') y = 0;
  @type('string') direction = 'down';
  @type('number') level = 1;
  @type('string') costumeId = 'default';
  @type('string') realm = 'hub';
}
