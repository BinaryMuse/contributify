import { assert } from 'chai'
import { getArgsParser } from '../src/entry'

describe('getArgsParser', () => {
  it('gets args', () => {
    const parser = getArgsParser()
    parser.parse(['create', 'test'], (err: any, argv: any, output: any) => {
      console.log(argv)
      console.log(output)
    })
  })
})

