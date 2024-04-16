'use strict'

const autocannon = require('autocannon')

autocannon({
  url: 'https://tiar.prod.bangpdk.dev/',
  connections: 10000, //default
  pipelining: 1, // default
  duration: 10 // default
}, console.log)

// async/await
async function foo () {
  const result = await autocannon({
    url: 'https://tiar.prod.bangpdk.dev/',
    connections: 10000, //default
    pipelining: 1, // default
    duration: 10 // default
  })
  console.log(result)
}

setInterval(foo,10)