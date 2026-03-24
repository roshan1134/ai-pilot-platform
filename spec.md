# AI Pilot Platform (AVIA)

## Current State
- Dashboard with flight gauges (circular + bar indicators with glow/pulse animations)
- AI chat panel, alert panel, decision log, mission status
- COMMS tab with P2P pilot messaging (broadcast + DM)
- TopNav with Dashboard / COMMS tabs

## Requested Changes (Diff)

### Add
- **Phase Chat**: A dedicated tab/panel where exactly 2 pilots can chat, with messages grouped/tagged by the current flight phase (PREFLIGHT, TAKEOFF, CLIMB, CRUISE, DESCENT, APPROACH, LANDING). Phase is shown as a header separator between phase transitions in the chat history.
- **Radar Panel**: A canvas-based radar display showing simulated aircraft contacts. Data is presented as if read from FADEC sensors processed through a CNN model. Shows a rotating sweep line, blips for detected aircraft (own ship + contacts), range rings, bearing labels. Contacts have callsign, bearing, range, altitude tags. FADEC-CNN data pipeline is simulated with realistic noise and detection confidence scores.

### Modify
- **FlightGauges bars (BarIndicator)**: Remove all glow box-shadows, remove `animate-pulse-critical`, remove `boxShadow` from bars. Keep color changes (red/amber/green) but no animations or glows. Bars should be plain flat rectangles.
- **CircularGauge**: Remove any glow/shadow effects on the arc or needle. Keep zone color logic but no boxShadow.
- **TopNav**: Add "PHASE CHAT" and "RADAR" tabs alongside Dashboard and COMMS.

### Remove
- Pulsing and glow effects from BarIndicator fills
- Any boxShadow on bar fills in FlightGauges

## Implementation Plan
1. Strip glow/pulse from BarIndicator in FlightGauges.tsx
2. Strip glow/pulse from CircularGauge.tsx
3. Add PHASE_CHAT and RADAR tabs to TopNav.tsx
4. Create PhaseChatPanel.tsx: 2-pilot phase-aware chat with callsign registration, phase labels as separators, message input
5. Create RadarPanel.tsx: canvas radar with rotating sweep, range rings, FADEC-CNN simulated contacts with confidence scores, bearing/range labels
6. Wire new tabs in App.tsx
