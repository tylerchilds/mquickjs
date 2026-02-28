import * as url from 'node:url'

if(import.meta.url.startsWith('file:')) {
  const modulePath = url.fileURLToPath(import.meta.url);
  if(process.argv[1] === modulePath) {
    await main()
  }
}

async function main() {
  await import("./as2.js").then(() => {
    const output = globalThis.as2(`


    # Int. Bengo Apt.

    ^fade out`)
    console.log(output)
  })

  process.exit()
}
