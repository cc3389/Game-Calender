export class GameCatalogConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameCatalogConfigError";
  }
}
