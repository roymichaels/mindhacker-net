import { Schema, type } from '@colyseus/schema';

export class NPCEntity extends Schema {
  @type('string') id = '';
  @type('string') name = '';
  @type('number') x = 0;
  @type('number') y = 0;
  @type('string') sprite = 'aurora';
}
