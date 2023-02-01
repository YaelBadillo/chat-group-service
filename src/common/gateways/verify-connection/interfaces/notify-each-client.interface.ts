export interface NotifyEachClient {
  notifyEachActiveClientOfARoom(
    room: string,
    eventName: string,
    message: string,
  ): void;
}
