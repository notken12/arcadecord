function filter(obj, schema, inProperty) {
  // recursively filter object
  let result = {}
  for (let key in schema) {
    if (typeof schema[key] === 'object' && !Array.isArray(schema[key])) {
      if (typeof obj[key] === 'object')
        result[key] = filter(
          obj[key],
          schema[key],
          inProperty ? inProperty + '.' + key + '.' : key + '.'
        )
      else
        throw new Error(
          `Object does not match schema: obj.${
            inProperty || ''
          }${key} is not a object`
        )
    } else if (obj.hasOwnProperty(key)) {
      // convert type to string
      // let type = typeof schema[key] === 'string' ? schema[key] || schema[key].name.toLowerCase()
      let type = schema[key]

      let typeName

      if (typeof type === 'string') typeName = type
      else if (typeof type === 'function') typeName = type.name.toLowerCase()
      else if (Array.isArray(type)) typeName = 'array'
      else typeName = typeof type

      let match = false
      let propType = typeof obj[key]
      if (type instanceof RegExp) {
        if (type.test(obj[key])) {
          match = true
        }
      } else if (typeof obj[key] === typeName) {
        match = true
      } else {
        if (typeof type === 'string' && propType === 'string') {
          if (type.length >= obj[key].length) match = true
          else
            throw new Error(
              `Object does not match schema: obj.${
                inProperty || ''
              }${key}.length is > the maximum length of ${type.length}`
            )
        } else if (
          (Array.isArray(type) || typeName === 'array') &&
          Array.isArray(obj[key])
        ) {
          if (type.length >= obj[key].length) match = true
          else
            throw new Error(
              `Object does not match schema: obj.${
                inProperty || ''
              }${key}.length is > the maximum length of ${type.length}`
            )
        }
      }

      if (!match) {
        throw new Error(
          `Object does not match schema: obj.${
            inProperty || ''
          }${key} is not a ${typeName}`
        )
      }

      result[key] = obj[key]
    }
  }
  return result
}

let schema = {
  move: {
    to: Array(2),
    from: Array(2),
    castle: Number,
    promotion: String(1),
    double: Boolean,
    capture: Boolean,
  },
}

let obj = {
  dog: true,
  move: {
    to: [1, 2],
    from: [1, 2],
    castle: 5,
    rog: 'sog',
    promotion: 'q',
    double: true,
    capture: true,
  },
}
let filtered = filter(obj, schema)

console.log(filtered)
