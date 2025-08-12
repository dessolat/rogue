class Enemy extends Character {
	#damage;
	
  constructor(x, y, hp = 50, damage = 5) {
    super(x, y, hp);
    this.#damage = damage;
  }
}

window.Enemy = Enemy;
