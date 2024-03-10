import { Env } from "./config";

export class RateLimiter implements DurableObject {
  static readonly milliseconds_per_request = 1;
  static readonly milliseconds_for_updates = 5000;
  static readonly capacity = 10000;

  state: DurableObjectState;
  tokens: number;

  constructor(state: DurableObjectState, _: Env) {
    this.state = state;
    this.tokens = RateLimiter.capacity;
  }

  async fetch(_request: Request): Promise<Response> {
    this.checkAndSetAlarm()

    let response = { milliseconds_to_next_request: RateLimiter.milliseconds_per_request };
    if (this.tokens > 0) {
      this.tokens -= 1;
      response.milliseconds_to_next_request = 0;
    }

    return new Response(JSON.stringify(response));
  }

  async checkAndSetAlarm() {
    let currentAlarm = await this.state.storage.getAlarm();
    if (currentAlarm == null) {
      this.state.storage.setAlarm(Date.now() +
        RateLimiter.milliseconds_for_updates * RateLimiter.milliseconds_per_request);
    }
  }

  async alarm() {
    if (this.tokens < RateLimiter.capacity) {
      this.tokens = Math.min(RateLimiter.capacity,
        this.tokens + RateLimiter.milliseconds_for_updates);
      this.checkAndSetAlarm()
    }
  }
}
