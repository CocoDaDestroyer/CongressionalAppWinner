// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ShoppingList } from './list'

beforeEach(() => localStorage.clear())

describe('ShoppingList', () => {
  it('starts from the starter list and persists changes', () => {
    const list = new ShoppingList({ 'c-milk': 1 })
    list.add('c-milk')
    list.add('c-eggs')
    expect(list.get()).toEqual({ 'c-milk': 2, 'c-eggs': 1 })
    expect(new ShoppingList({}).get()).toEqual({ 'c-milk': 2, 'c-eggs': 1 })
  })

  it('never goes below zero and notifies subscribers with a new object', () => {
    const list = new ShoppingList({ 'c-milk': 1 })
    const listener = vi.fn()
    list.subscribe(listener)
    const before = list.get()
    list.set('c-milk', -3)
    expect(list.get()['c-milk']).toBe(0)
    expect(list.get()).not.toBe(before)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('resets to the starter list and survives corrupt storage', () => {
    const list = new ShoppingList({ 'c-milk': 1 })
    list.set('c-milk', 5)
    list.reset()
    expect(list.get()).toEqual({ 'c-milk': 1 })
    localStorage.setItem('cartwise.list.v1', '{nope')
    expect(new ShoppingList({ 'c-milk': 1 }).get()).toEqual({ 'c-milk': 1 })
  })
})
