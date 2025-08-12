class Player extends Character {
  #damage;

  constructor(x, y, hp = 100, damage = 15) {
    super(x, y, hp);
    this.#damage = damage;
  }

  boostDamage(amount) {
    this.#damage += amount;
  }

  attackEnemies(enemies) {
    const playerCoords = this.getCoords();

    for (let e of enemies) {
      const enemyCoords = e.getCoords();

      if (Math.abs(enemyCoords.x - playerCoords.x) + Math.abs(enemyCoords.y - playerCoords.y) === 1) {
        e.takeDamage(this.#damage);
      }
    }
  }
}

window.Player = Player;
