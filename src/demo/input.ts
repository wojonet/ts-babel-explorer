const q: number = 5

const y = {
  get impure() {
    return 3
  },
}

function aFun() {
  return Math.random()
}

const getty = (userId: number) => {
  userId = 10
  const fn = (x: any) => x.id === aFun()
  return fn(userId)
}
