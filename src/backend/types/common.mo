import Types "mo:core/Types";

module {
  // Cross-cutting shared types
  public type Result<T, E> = Types.Result<T, E>;
  public type Timestamp = Int;

  // Chat message history entry for AI proxy
  public type ChatMessage = {
    role    : Text;
    content : Text;
  };
};
