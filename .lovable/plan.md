
# Advanced Voice Mode for Aurora

## Overview
Add a real-time, bidirectional voice conversation mode between the user and Aurora -- similar to ChatGPT's Advanced Voice Mode. The user taps a button, enters a full-screen (or overlay) voice session where they speak naturally, Aurora listens, processes, and responds with voice -- creating a seamless back-and-forth conversation loop.

This will be available in:
1. The **AuroraDock** (global chat input bar)
2. The **DomainAssessChat** (pillar assessments)
3. The **AuroraChatInput** (used inside assessment modals)

## How It Works

```text
User taps Voice Mode button
        |
        v
+---------------------------+
|   Full-screen Voice UI    |
|                           |
|   [Aurora Orb animating]  |
|                           |
|   State: LISTENING        |
|   "Speak now..."          |
|                           |
|   [End Call]              |
+---------------------------+
        |
  User speaks -> STT (ElevenLabs transcribe)
        |
  Transcript sent to Aurora chat (existing aurora-chat edge fn)
        |
  Aurora responds with text
        |
  Text -> TTS (ElevenLabs TTS) -> plays audio
        |
  When audio ends -> back to LISTENING
        |
  Loop continues until user taps "End"
```

## Components to Create

### 1. `src/components/aurora/AuroraVoiceMode.tsx` (New)
The main voice mode overlay/modal component:
- Full-screen dark overlay with the **AuroraHoloOrb** as the centerpiece (animated based on state)
- States: `idle`, `listening`, `processing`, `speaking`
- Visual audio waveform/level indicator while listening
- Aurora orb pulses/glows while speaking
- "End Call" button to exit
- Transcript display (shows what user said + Aurora's response text)
- Uses existing `useAuroraVoice` for STT + TTS
- Auto-loop: after Aurora finishes speaking, automatically starts listening again

### 2. `src/hooks/aurora/useAuroraVoiceMode.tsx` (New)
Custom hook that orchestrates the full voice conversation loop:
- Manages the state machine: `idle -> listening -> processing -> speaking -> listening`
- Uses existing `useAuroraVoice` for recording/transcription
- On transcription complete: sends message via the chat context's `sendMessageRef` (for AuroraDock) or a provided `onSend` callback (for assessments)
- Watches for Aurora's response (new assistant message) and auto-plays via TTS
- Handles the auto-loop (when TTS ends, restart recording)
- Graceful error handling with fallback states
- Cleanup on unmount (stop recording, stop playback)

### 3. `src/components/aurora/VoiceModeButton.tsx` (New)
A reusable button that triggers voice mode:
- Headphone/waveform icon
- Opens the `AuroraVoiceMode` overlay when tapped
- Can be placed in any chat input bar

## Integration Points

### GlobalChatInput (AuroraDock)
- Add `VoiceModeButton` next to the existing voice recording button
- When voice mode is active, messages flow through the existing `sendMessageRef` mechanism
- Aurora responses are detected from the streaming state + messages list

### AuroraChatInput (Assessments)
- Add `VoiceModeButton` next to the existing mic button
- Messages flow through the `onSend` prop
- Aurora responses come from the parent `DomainAssessChat` messages state

### DomainAssessChat
- No direct changes needed -- voice mode works through `AuroraChatInput` which already has the `onSend` callback

## Voice Conversation Flow (Technical)

1. User enters voice mode -> `AuroraVoiceMode` overlay opens
2. Auto-starts recording via `navigator.mediaDevices.getUserMedia`
3. User stops speaking (manual tap or silence detection)
4. Audio sent to `elevenlabs-transcribe` edge function (existing)
5. Transcribed text sent as chat message via existing chat infrastructure
6. Hook monitors for new assistant messages in the conversation
7. When assistant message arrives, sends text to `elevenlabs-tts` edge function (existing)
8. Audio plays back through the browser
9. On audio end, auto-restart recording for next turn
10. User taps "End" to exit voice mode

## UI Design

- **Overlay**: Full viewport, dark background with subtle gradient, `z-50`
- **Center**: Large AuroraHoloOrb (96px+) with state-dependent animations
  - Listening: gentle pulse with mic-level reactivity
  - Processing: spinning/loading animation
  - Speaking: rhythmic glow synced with audio output
- **Bottom**: "End Call" button (red, rounded-full)
- **Top**: Small transcript area showing last exchange
- **RTL Support**: Full Hebrew/English bilingual labels

## Files Summary

| File | Action |
|------|--------|
| `src/hooks/aurora/useAuroraVoiceMode.tsx` | Create -- orchestration hook |
| `src/components/aurora/AuroraVoiceMode.tsx` | Create -- full-screen voice UI |
| `src/components/aurora/VoiceModeButton.tsx` | Create -- trigger button |
| `src/components/dashboard/GlobalChatInput.tsx` | Edit -- add VoiceModeButton |
| `src/components/aurora/AuroraChatInput.tsx` | Edit -- add VoiceModeButton |

No new edge functions needed -- reuses existing `elevenlabs-transcribe` and `elevenlabs-tts`. No database changes required.
