import fs from 'node:fs';

const databasePath = new URL('db.json', import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, (err, data) => {
      if(err) return;

      if(data) {
        this.#database = JSON.parse(data);
      } else {
        this.#persist();
      }
    });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database), (err) => {
      if(err) {
        console.error(err);
      }
    });
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        })
      })
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      const row = this.#database[table][rowIndex]
      this.#database[table][rowIndex] = { id, ...row, ...data }
      this.#persist()
    }
  }
}