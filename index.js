class Game {
  constructor() {
    this.width = 40;
    this.height = 24;
    this.tileSize = 40;
    this.map = [];
    this.player = null;
    this.enemies = [];
    this.items = [];
  }

  init() {
    this.generateMap();
    this.ensureConnectivity();
    this.placeItems();
    this.placePlayer();
    this.placeEnemies();
    this.render();
    this.bindKeys();
    this.startEnemyMovement();
  }

  generateMap() {
    // Заполняем карту стенами
    for (let y = 0; y < this.height; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.map[y][x] = { type: 'W' }; // wall
      }
    }

    // Создаем комнаты
    const roomCount = this.rand(5, 10);
    for (let i = 0; i < roomCount; i++) {
      let rw = this.rand(3, 8);
      let rh = this.rand(3, 8);
      let rx = this.rand(1, this.width - rw - 1);
      let ry = this.rand(1, this.height - rh - 1);
      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          this.map[y][x] = { type: ' ' };
        }
      }
    }

    // Вертикальные коридоры
    const vCount = this.rand(3, 5);
    for (let i = 0; i < vCount; i++) {
      let x = this.rand(1, this.width - 2);
      for (let y = 0; y < this.height; y++) {
        this.map[y][x] = { type: ' ' };
      }
    }

    // Горизонтальные коридоры
    const hCount = this.rand(3, 5);
    for (let i = 0; i < hCount; i++) {
      let y = this.rand(1, this.height - 2);
      for (let x = 0; x < this.width; x++) {
        this.map[y][x] = { type: ' ' };
      }
    }
  }

  ensureConnectivity() {
    let reachable = this.floodFill(1, 1);
    let totalEmpty = this.getAllEmptyCells();

    while (reachable.length < totalEmpty.length) {
      let unreachableCells = totalEmpty.filter(c => !reachable.some(r => r.x === c.x && r.y === c.y));

      if (unreachableCells.length === 0) break;

      // Берём любую изолированную клетку (например, ближнюю к основной зоне)
      let isolatedCell = this.findNearestReachable(
        // Находим точку основной зоны
        reachable[0],
        unreachableCells
      );

      let nearest = this.findNearestReachable(isolatedCell, reachable);

      if (nearest === null) {
        break;
      }

      // Прямой коридор
      if (isolatedCell.x === nearest.x) {
        let y1 = Math.min(isolatedCell.y, nearest.y);
        let y2 = Math.max(isolatedCell.y, nearest.y);
        for (let y = y1; y <= y2; y++) {
          this.map[y][isolatedCell.x] = { type: ' ' };
        }
      } else if (isolatedCell.y === nearest.y) {
        let x1 = Math.min(isolatedCell.x, nearest.x);
        let x2 = Math.max(isolatedCell.x, nearest.x);
        for (let x = x1; x <= x2; x++) {
          this.map[isolatedCell.y][x] = { type: ' ' };
        }
      } else {
        // Выбираем коридор по оси с наименьшим расстоянием
        if (Math.abs(isolatedCell.x - nearest.x) < Math.abs(isolatedCell.y - nearest.y)) {
          let x1 = Math.min(isolatedCell.x, nearest.x);
          let x2 = Math.max(isolatedCell.x, nearest.x);
          for (let x = x1; x <= x2; x++) {
            this.map[isolatedCell.y][x] = { type: ' ' };
          }
        } else {
          let y1 = Math.min(isolatedCell.y, nearest.y);
          let y2 = Math.max(isolatedCell.y, nearest.y);
          for (let y = y1; y <= y2; y++) {
            this.map[y][isolatedCell.x] = { type: ' ' };
          }
        }
      }

      reachable = this.floodFill(1, 1);
    }
  }

  floodFill(sx, sy) {
    let visited = [];
    let stack = [{ x: sx, y: sy }];

    while (stack.length) {
      let { x, y } = stack.pop();
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) continue;
      if (visited.some(v => v.x === x && v.y === y)) continue;
      if (this.map[y][x].type !== ' ') continue;

      visited.push({ x, y });
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
    return visited;
  }

  getAllEmptyCells() {
    let cells = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.map[y][x].type === ' ') {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }

  findNearestReachable(cell, reachable) {
    let minDist = Infinity;
    let nearest = null;

    for (let r of reachable) {
      if (!r || typeof r.x !== 'number' || typeof r.y !== 'number') {
        continue;
      }
      if (!cell || typeof cell.x !== 'number' || typeof cell.y !== 'number') {
        return null;
      }
      let dist = Math.abs(cell.x - r.x) + Math.abs(cell.y - r.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = r;
      }
    }
    return nearest;
  }

  placeItems() {
    for (let i = 0; i < 2; i++) this.placeRandom('SW'); // sword
    for (let i = 0; i < 10; i++) this.placeRandom('HP'); // health potion
  }

  placePlayer() {
    let pos = this.randomEmptyCell();
    this.player = new Player(pos.x, pos.y);
  }

  placeEnemies() {
    for (let i = 0; i < 10; i++) {
      let pos = this.randomEmptyCell();
      this.enemies.push(new Enemy(pos.x, pos.y));
    }
  }

  placeRandom(type) {
    let pos = this.randomEmptyCell();
    this.items.push(new Item(pos.x, pos.y, type));
  }

  randomEmptyCell() {
    let empty = this.getAllEmptyCells().filter(
      c =>
        !(this.player && this.player.isOnCell(c.x, c.y)) &&
        !this.enemies.some(e => e.isOnCell(c.x, c.y)) &&
        !this.items.some(i => i.isOnCell(c.x, c.y))
    );
    return empty[Math.floor(Math.random() * empty.length)];
  }

  render() {
    const field = $('.field');
    field.empty();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let cell = this.map[y][x];
        let tile = $('<div class="tile"></div>').css({ left: x * this.tileSize, top: y * this.tileSize });

        if (cell.type === 'W') tile.addClass('tileW');

        let item = this.items.find(i => i.isOnCell(x, y));
        if (item) {
          const itemType = item.getType();

          if (itemType === 'SW') tile.addClass('tileSW');
          if (itemType === 'HP') tile.addClass('tileHP');
        }

        if (this.player.isOnCell(x, y)) {
          tile.addClass('tileP');
          tile.append($('<div class="health"></div>').css('width', this.player.getHp() + '%'));
        }

        let enemy = this.enemies.find(e => e.isOnCell(x, y));
        if (enemy) {
          tile.addClass('tileE');
          tile.append($('<div class="health"></div>').css('width', enemy.getHp() + '%'));
        }

        field.append(tile);
      }
    }
  }

  bindKeys() {
    $(document).on('keydown', e => {
      let dx = 0,
        dy = 0;
      if (e.key === 'w') dy = -1;
      if (e.key === 's') dy = 1;
      if (e.key === 'a') dx = -1;
      if (e.key === 'd') dx = 1;

      if (dx !== 0 || dy !== 0) {
        this.movePlayer(dx, dy);
        this.render();
      }

      if (e.code === 'Space') {
        e.preventDefault();

        this.player.attackEnemies(this.enemies);
        this.removeDeadEnemies();
        this.render();
      }
    });
  }

  removeDeadEnemies() {
    this.enemies = this.enemies.filter(e => e.getHp() > 0);
  }

  movePlayer(dx, dy) {
    const { x, y } = this.player.getCoords();

    let nx = x + dx;
    let ny = y + dy;

    if (this.map[ny][nx].type !== 'W') {
      this.player.move(dx, dy);
    }

    let itemIndex = this.items.findIndex(i => i.isOnCell(nx, ny));
    if (itemIndex >= 0) {
      let item = this.items[itemIndex];

      const itemType = item.getType();

      if (itemType === 'HP') this.player.recoverHp(30);
      if (itemType === 'SW') this.player.boostDamage(10);

      this.items.splice(itemIndex, 1);
    }
  }

  startEnemyMovement() {
    setInterval(() => {
      const playerCoords = this.player.getCoords();

      for (let e of this.enemies) {
        const enemyCoords = e.getCoords();

        if (Math.abs(enemyCoords.x - playerCoords.x) + Math.abs(enemyCoords.y - playerCoords.y) === 1) {
          this.player.takeDamage(5);
        } else {
          let dirs = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
          ];
          let d = dirs[Math.floor(Math.random() * dirs.length)];

          let nx = enemyCoords.x + d.dx;
          let ny = enemyCoords.y + d.dy;

          if (this.map[ny][nx].type !== 'W' && !this.enemies.some(en => en.isOnCell(nx, ny))) {
            e.move(d.dx, d.dy);
          }
        }
      }
      this.render();
    }, 500);
  }

  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

window.Game = Game;
