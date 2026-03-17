const q: number = 5

const y = {
  get impure() {
    return 3
  },
}

const fn = (x: any) => x.id === q
