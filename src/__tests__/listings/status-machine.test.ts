import { describe, it, expect } from 'vitest'
import { canTransition, getAvailableActions, TRANSITIONS } from '@/lib/listings/status-machine'

describe('canTransition', () => {
  it('allows seller to submit draft', () => {
    expect(canTransition('draft', 'pending', 'seller')).toBe(true)
  })

  it('prevents seller from approving', () => {
    expect(canTransition('pending', 'active', 'seller')).toBe(false)
  })

  it('allows admin to approve', () => {
    expect(canTransition('pending', 'active', 'admin')).toBe(true)
  })

  it('prevents invalid transition', () => {
    expect(canTransition('draft', 'active', 'admin')).toBe(false)
  })

  it('allows seller to resubmit rejected listing', () => {
    expect(canTransition('rejected', 'pending', 'seller')).toBe(true)
  })

  it('allows admin to reject pending listing', () => {
    expect(canTransition('pending', 'rejected', 'admin')).toBe(true)
  })

  it('prevents seller from rejecting listing', () => {
    expect(canTransition('pending', 'rejected', 'seller')).toBe(false)
  })

  it('allows seller to mark active listing as sold', () => {
    expect(canTransition('active', 'sold', 'seller')).toBe(true)
  })

  it('allows admin to mark active listing as sold', () => {
    expect(canTransition('active', 'sold', 'admin')).toBe(true)
  })

  it('allows seller to delist active listing', () => {
    expect(canTransition('active', 'delisted', 'seller')).toBe(true)
  })

  it('allows seller to relist a delisted listing', () => {
    expect(canTransition('delisted', 'pending', 'seller')).toBe(true)
  })
})

describe('getAvailableActions', () => {
  it('returns submit for draft seller', () => {
    const actions = getAvailableActions('draft', 'seller')
    expect(actions).toContainEqual({ action: 'submit', targetStatus: 'pending' })
  })

  it('returns no actions for draft admin', () => {
    const actions = getAvailableActions('draft', 'admin')
    expect(actions).toHaveLength(0)
  })

  it('returns approve and reject for pending admin', () => {
    const actions = getAvailableActions('pending', 'admin')
    expect(actions).toContainEqual({ action: 'approve', targetStatus: 'active' })
    expect(actions).toContainEqual({ action: 'reject', targetStatus: 'rejected' })
  })

  it('returns markSold and delist for active seller', () => {
    const actions = getAvailableActions('active', 'seller')
    expect(actions).toContainEqual({ action: 'markSold', targetStatus: 'sold' })
    expect(actions).toContainEqual({ action: 'delist', targetStatus: 'delisted' })
  })

  it('returns resubmit for rejected seller', () => {
    const actions = getAvailableActions('rejected', 'seller')
    expect(actions).toContainEqual({ action: 'resubmit', targetStatus: 'pending' })
  })

  it('returns relist for delisted seller', () => {
    const actions = getAvailableActions('delisted', 'seller')
    expect(actions).toContainEqual({ action: 'relist', targetStatus: 'pending' })
  })

  it('returns no actions for sold listing', () => {
    const actions = getAvailableActions('sold', 'seller')
    expect(actions).toHaveLength(0)
  })
})

describe('TRANSITIONS', () => {
  it('has 7 defined transitions', () => {
    expect(TRANSITIONS).toHaveLength(7)
  })

  it('all transitions have required fields', () => {
    for (const t of TRANSITIONS) {
      expect(t).toHaveProperty('from')
      expect(t).toHaveProperty('to')
      expect(t).toHaveProperty('action')
      expect(t).toHaveProperty('allowedRoles')
      expect(Array.isArray(t.allowedRoles)).toBe(true)
    }
  })
})
