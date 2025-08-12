class Item extends Entity {
	#type;

  constructor(x, y, type) {
    super(x, y);
    this.#type = type;
  }

	getType() {
		return this.#type;
	}
}

window.Item = Item;
