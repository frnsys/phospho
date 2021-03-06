import Cell from './cell.js';

const defaultColor = 0x23ce61;

const types = {
  g: {
    name: 'grass',
    color: 0x23ce61
  },
  d: {
    name: 'desert',
    color: 0xeac73a
  },
  f: {
    name: 'forest',
    color: 0x158911
  },
  j: {
    name: 'jungle',
    color: 0x5ac138
  },
  o: {
    name: 'ocean',
    color: 0x0b18a5
  },
  a: {
    name: 'arctic',
    color: 0xe0e2f9
  }
};

class Grid {
  constructor(cols, rows, size) {
    this.nCols = cols;
    this.nRows = rows;
    this.cellSize = size/2;
    this.cellHeight = this.cellSize * 2;
    this.cellWidth = Math.sqrt(3)/2 * this.cellHeight;
    this.width = cols * this.cellWidth;
    this.height = rows * this.cellHeight;
    this.group = new THREE.Group();

    // initialize null grid
    this.grid = [];
    for (let col=0; col<this.nCols; col++) {
      this.grid[col] = [];
      for (let row=0; row<this.nRows; row++) {
        this.grid[col].push(null);
        this.setCellAt(col, row, defaultColor);
      }
    }
    this.group.position.x = -this.width/2;
    this.group.position.y = this.height/2;
  }

  get cells() {
    return [].concat(...this.grid);
  }

  cellAt(col, row) {
    return this.grid[col][row];
  }

  setCellAt(col, row, color, data) {
    let existing = this.grid[col][row];
    if (existing) {
      this.group.remove(existing.mesh);
    }
    let [x, y] = this.cellPosition(col, row);
    let cell = new Cell(x, y, this.cellSize, color, data);
    cell.col = col;
    cell.row = row;
    this.grid[col][row] = cell;
    this.group.add(cell.mesh);
  }

  // odd-r positioning
  cellPosition(col, row) {
    let x = col*this.cellWidth + this.cellWidth/2;
    let y = -row*(this.cellHeight*3/4) + this.cellHeight/2;
    if (row % 2 == 1) {
      x += this.cellWidth/2;
    }
    return [x, y];
  }

  neighborPositionsAt(col, row) {
    let positions = [];
    if (col > 0) {
      positions.push([col-1, row]);
      if (row > 0) positions.push([col-1, row-1]);
      if (row<this.nRows-1) positions.push([col-1, row+1]);
    }
    if (col<this.nCols-1) {
      positions.push([col+1, row]);
      if (row>0) positions.push([col+1, row-1]);
      if (row<this.nRows-1) positions.push([col+1, row+1]);
    }
    if (row>0) positions.push([col, row-1]);
    if (row<this.nRows-1) positions.push([col, row+1]);
    return positions;
  }

  neighborsAt(col, row) {
    return this.neighborPositionsAt(col, row).map((pos) => {
      let cell = this.cellAt(pos[0], pos[1]);
      return {
        col: pos[0],
        row: pos[1],
        cell: cell
      };
    });
  }
}

Grid.fromMap = function(map, cellSize) {
  let nRows = map.length, nCols = 0;
  map.forEach((row) => {
    if (row.length > nCols) {
      nCols = row.length;
    }
  });
  let grid = new Grid(nCols, nRows, cellSize);

  map.forEach((row, r) => {
    row.forEach((type, c) => {
      let data = types[type];
      grid.setCellAt(c, r, data.color, data);
    });
  });

  return grid;
}

export default Grid;
