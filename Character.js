class Character extends Entity {
  #hp;
  #maxHp;

  constructor(x, y, hp) {
    super(x, y);
    this.#hp = hp;
    this.#maxHp = hp;
  }

  move(dx, dy) {
    const curCoords = this.getCoords();
    this.setCoords(curCoords.x + dx, curCoords.y + dy);
  }

  getHp() {
    return this.#hp;
  }

  recoverHp(amount) {
    this.#hp = Math.min(this.#maxHp, this.#hp + amount);
  }

  takeDamage(damage) {
    this.#hp -= damage;

    if (this.#hp < 0) {
      this.#hp = 0;
    }
  }
}

window.Character = Character;
