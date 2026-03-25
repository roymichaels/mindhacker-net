import { Room, Client } from 'colyseus';
import { supabaseAdmin } from '../lib/supabase.js';
import { HubState } from '../schema/HubState.js';
import { PlayerState } from '../schema/PlayerState.js';
import { NPCEntity } from '../schema/NPCEntity.js';

interface AuthContext {
  userId: string;
  email?: string;
  displayName?: string;
  level: number;
  realm: string;
  costumeId: string;
}

interface MovePayload {
  x: number;
  y: number;
  direction?: string;
}

interface InteractNpcPayload {
  npcId: string;
}

interface ClaimQuestPayload {
  questId: string;
}

export class HubRoom extends Room<HubState> {
  maxClients = 200;

  onCreate() {
    this.setState(new HubState());
    this.seedNpcs();
    this.setSimulationInterval((dt) => this.update(dt), 50);

    this.onMessage('move', (client, payload: MovePayload) => this.handleMove(client, payload));
    this.onMessage('interact_npc', (client, payload: InteractNpcPayload) => this.handleNpcInteraction(client, payload));
    this.onMessage('claim_quest', (client, payload: ClaimQuestPayload) => this.handleQuestClaim(client, payload));
  }

  async onAuth(client: Client, options: { token?: string }, _context: unknown): Promise<AuthContext> {
    if (!options?.token) {
      throw new Error('Missing auth token');
    }

    const { data, error } = await supabaseAdmin.auth.getUser(options.token);
    if (error || !data.user) {
      throw new Error('Invalid auth token');
    }

    const { data: profile } = await supabaseAdmin
      .from('game_profiles')
      .select('level, realm, costume_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    return {
      userId: data.user.id,
      email: data.user.email,
      displayName:
        (typeof data.user.user_metadata?.full_name === 'string' && data.user.user_metadata.full_name) ||
        data.user.email ||
        'Explorer',
      level: profile?.level ?? 1,
      realm: profile?.realm ?? 'hub',
      costumeId: profile?.costume_id ?? 'default',
    };
  }

  async onJoin(client: Client, _options: unknown, auth: AuthContext) {
    const player = new PlayerState();
    player.userId = auth.userId;
    player.displayName = auth.displayName || 'Explorer';
    player.level = auth.level;
    player.realm = auth.realm;
    player.costumeId = auth.costumeId;
    player.x = 320 + Math.round(Math.random() * 120);
    player.y = 240 + Math.round(Math.random() * 120);

    this.state.players.set(client.sessionId, player);

    await supabaseAdmin.from('game_sessions').upsert({
      user_id: auth.userId,
      room_id: this.roomId,
      room_type: 'hub',
      realm: 'hub',
      position_x: player.x,
      position_y: player.y,
      direction: player.direction,
      is_online: true,
      last_seen_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }

  async onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId);
    this.state.players.delete(client.sessionId);

    if (player?.userId) {
      await supabaseAdmin
        .from('game_sessions')
        .update({ is_online: false, last_seen_at: new Date().toISOString() })
        .eq('user_id', player.userId);
    }
  }

  private async handleMove(client: Client, payload: MovePayload) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.x = Math.max(0, Math.min(4000, Math.round(payload.x)));
    player.y = Math.max(0, Math.min(4000, Math.round(payload.y)));
    player.direction = payload.direction || player.direction;

    await supabaseAdmin
      .from('game_sessions')
      .update({
        position_x: player.x,
        position_y: player.y,
        direction: player.direction,
        last_seen_at: new Date().toISOString(),
        is_online: true,
      })
      .eq('user_id', player.userId);
  }

  private handleNpcInteraction(client: Client, payload: InteractNpcPayload) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    this.send(client, 'npc_dialogue', {
      npcId: payload.npcId,
      source: 'stub',
      message: `AION sees you, ${player.displayName}. The OpenClaw NPC layer will answer this interaction next.`,
    });
  }

  private handleQuestClaim(client: Client, payload: ClaimQuestPayload) {
    this.send(client, 'quest_claim_result', {
      questId: payload.questId,
      valid: false,
      source: 'stub',
      message: 'Quest validation is not wired yet. Hook quest-validator agent next.',
    });
  }

  private update(_dt: number) {
    this.broadcast('tick', { serverTime: Date.now() }, { except: undefined });
  }

  private seedNpcs() {
    const aurora = new NPCEntity();
    aurora.id = 'aurora';
    aurora.name = 'Aurora';
    aurora.sprite = 'aurora';
    aurora.x = 420;
    aurora.y = 320;

    const banker = new NPCEntity();
    banker.id = 'banker';
    banker.name = 'Banker';
    banker.sprite = 'banker';
    banker.x = 640;
    banker.y = 280;

    const shopkeeper = new NPCEntity();
    shopkeeper.id = 'shopkeeper';
    shopkeeper.name = 'Shopkeeper';
    shopkeeper.sprite = 'shopkeeper';
    shopkeeper.x = 240;
    shopkeeper.y = 520;

    this.state.npcs.set(aurora.id, aurora);
    this.state.npcs.set(banker.id, banker);
    this.state.npcs.set(shopkeeper.id, shopkeeper);
  }
}
