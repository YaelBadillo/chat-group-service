export interface NotifyEachClient {
  notifyEachActiveClientOfARoom(
    room: string,
    eventName: string,
    message: unknown,
  ): void;
}
