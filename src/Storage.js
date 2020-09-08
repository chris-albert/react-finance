import _ from 'lodash'

const Storage = {
  create: (name, id, data) => {
    console.debug(`Storing [${name}] with id [${id}]`, data)
    const found = Storage.get(name)
    _.put(name, id, data)
    Storage.createAll(name, found)
  },
  createAll: (name, data) => {
    console.debug(`Storing all [${name}]`, data)
    localStorage.setItem(name, JSON.stringify(data))
  },
  deleteAll: name => {
    localStorage.removeItem(name)
  },
  deleteById: (name, id) => {
    const found = Storage.get(name)
    _.remove(name, id)
    Storage.createAll(name, found)
  },
  get: name => {
    return JSON.parse(localStorage.getItem(name))
  },
  getById: (name, id) => {
    return _.get(id, Storage.get(name))
  },
  updateById: (name, id, data) => {
    const found = Storage.get(name)
    _.put(name, id, data)
    Storage.createAll(name, found)
  }
}

export default Storage