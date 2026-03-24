import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

actor {
  type LogEntry = {
    id : Nat;
    timestamp : Int;
    role : Text;
    message : Text;
    flightPhase : Text;
  };

  type FlightSession = {
    id : Nat;
    startTime : Int;
    destination : Text;
    phase : Text;
    entries : [LogEntry];
  };

  public type FlightSessionSummary = {
    id : Nat;
    startTime : Int;
    destination : Text;
    phase : Text;
  };

  public type PilotMessage = {
    id : Nat;
    timestamp : Int;
    fromCallsign : Text;
    toCallsign : Text; // "BROADCAST" or specific callsign
    content : Text;
  };

  module FlightSessionSummary {
    public func fromFlightSession(session : FlightSession) : FlightSessionSummary {
      {
        id = session.id;
        startTime = session.startTime;
        destination = session.destination;
        phase = session.phase;
      };
    };
  };

  var nextSessionId = 1;
  var nextLogEntryId = 1;
  var nextMessageId = 1;
  var currentSessionId : ?Nat = null;

  let sessions = Map.empty<Nat, FlightSession>();
  let callsigns = Map.empty<Principal, Text>();
  let pilotMessages = Map.empty<Nat, PilotMessage>();

  public shared ({ caller }) func startFlightSession(destination : Text, phase : Text) : async Nat {
    let sessionId = nextSessionId;
    nextSessionId += 1;

    let newSession : FlightSession = {
      id = sessionId;
      startTime = Time.now();
      destination;
      phase;
      entries = [];
    };

    sessions.add(sessionId, newSession);
    currentSessionId := ?sessionId;
    sessionId;
  };

  public shared ({ caller }) func addLogEntry(sessionId : Nat, role : Text, message : Text, flightPhase : Text) : async Nat {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        let logEntryId = nextLogEntryId;
        nextLogEntryId += 1;

        let newEntry : LogEntry = {
          id = logEntryId;
          timestamp = Time.now();
          role;
          message;
          flightPhase;
        };

        let updatedEntries = session.entries.concat([newEntry]);
        let updatedSession : FlightSession = {
          id = session.id;
          startTime = session.startTime;
          destination = session.destination;
          phase = session.phase;
          entries = updatedEntries;
        };

        sessions.add(sessionId, updatedSession);
        logEntryId;
      };
    };
  };

  public query ({ caller }) func getLogEntries(sessionId : Nat) : async [LogEntry] {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) { session.entries };
    };
  };

  public query ({ caller }) func getFlightSessionSummaries() : async [FlightSessionSummary] {
    sessions.values().toArray().map(FlightSessionSummary.fromFlightSession);
  };

  public query ({ caller }) func getCurrentSession() : async ?FlightSession {
    switch (currentSessionId) {
      case (null) { return null };
      case (?id) { sessions.get(id) };
    };
  };

  public shared ({ caller }) func updateFlightPhase(sessionId : Nat, newPhase : Text) : async () {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        let updatedSession : FlightSession = {
          id = session.id;
          startTime = session.startTime;
          destination = session.destination;
          phase = newPhase;
          entries = session.entries;
        };
        sessions.add(sessionId, updatedSession);
      };
    };
  };

  // ── P2P Pilot Communication ──────────────────────────

  public shared ({ caller }) func registerCallsign(callsign : Text) : async () {
    callsigns.add(caller, callsign);
  };

  public query ({ caller }) func getCallsign() : async ?Text {
    callsigns.get(caller);
  };

  public query func getOnlinePilots() : async [Text] {
    callsigns.values().toArray();
  };

  public shared ({ caller }) func sendBroadcast(content : Text) : async Nat {
    switch (callsigns.get(caller)) {
      case (null) { Runtime.trap("Register a callsign first") };
      case (?fromCallsign) {
        let msgId = nextMessageId;
        nextMessageId += 1;
        let msg : PilotMessage = {
          id = msgId;
          timestamp = Time.now();
          fromCallsign;
          toCallsign = "BROADCAST";
          content;
        };
        pilotMessages.add(msgId, msg);
        msgId;
      };
    };
  };

  public shared ({ caller }) func sendDirectMessage(toCallsign : Text, content : Text) : async Nat {
    switch (callsigns.get(caller)) {
      case (null) { Runtime.trap("Register a callsign first") };
      case (?fromCallsign) {
        let msgId = nextMessageId;
        nextMessageId += 1;
        let msg : PilotMessage = {
          id = msgId;
          timestamp = Time.now();
          fromCallsign;
          toCallsign;
          content;
        };
        pilotMessages.add(msgId, msg);
        msgId;
      };
    };
  };

  public query ({ caller }) func getMessages() : async [PilotMessage] {
    let myCallsign = callsigns.get(caller);
    pilotMessages.values().toArray().filter(func(msg : PilotMessage) : Bool {
      if (msg.toCallsign == "BROADCAST") return true;
      switch (myCallsign) {
        case (null) { false };
        case (?cs) {
          msg.fromCallsign == cs or msg.toCallsign == cs;
        };
      };
    });
  };
};
