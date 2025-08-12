class Entity {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  getCoords() {
    return { x: this.#x, y: this.#y };
  }

  setCoords(x, y) {
    this.#x = x;
    this.#y = y;
  }

  isOnCell(x, y) {
    return this.#x === x && this.#y === y;
  }
}

window.Entity = Entity;
