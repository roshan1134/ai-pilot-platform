import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FlightSession {
    id: bigint;
    startTime: bigint;
    destination: string;
    entries: Array<LogEntry>;
    phase: string;
}
export interface FlightSessionSummary {
    id: bigint;
    startTime: bigint;
    destination: string;
    phase: string;
}
export interface LogEntry {
    id: bigint;
    role: string;
    message: string;
    flightPhase: string;
    timestamp: bigint;
}
export interface PilotMessage {
    id: bigint;
    timestamp: bigint;
    fromCallsign: string;
    toCallsign: string;
    content: string;
}
export interface backendInterface {
    addLogEntry(sessionId: bigint, role: string, message: string, flightPhase: string): Promise<bigint>;
    getCurrentSession(): Promise<FlightSession | null>;
    getFlightSessionSummaries(): Promise<Array<FlightSessionSummary>>;
    getLogEntries(sessionId: bigint): Promise<Array<LogEntry>>;
    startFlightSession(destination: string, phase: string): Promise<bigint>;
    updateFlightPhase(sessionId: bigint, newPhase: string): Promise<void>;
    registerCallsign(callsign: string): Promise<void>;
    getCallsign(): Promise<string | null>;
    getOnlinePilots(): Promise<Array<string>>;
    sendBroadcast(content: string): Promise<bigint>;
    sendDirectMessage(toCallsign: string, content: string): Promise<bigint>;
    getMessages(): Promise<Array<PilotMessage>>;
}
