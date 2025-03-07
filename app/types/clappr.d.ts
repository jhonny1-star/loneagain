declare module '@clappr/player' {
  export default class Clappr {
    constructor(options: any);
    destroy(): void;
    on(event: string, callback: (error?: any) => void): void;
    static Events: {
      PLAYER_ERROR: string;
      ERROR: string;
    };
  }
} 