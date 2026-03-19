import type { ListingStatus } from './types'

type StatusTransition = {
  from: ListingStatus
  to: ListingStatus
  action: string
  allowedRoles: ('seller' | 'admin')[]
}

export const TRANSITIONS: StatusTransition[] = [
  { from: 'draft', to: 'pending', action: 'submit', allowedRoles: ['seller'] },
  { from: 'pending', to: 'active', action: 'approve', allowedRoles: ['admin'] },
  { from: 'pending', to: 'rejected', action: 'reject', allowedRoles: ['admin'] },
  { from: 'rejected', to: 'pending', action: 'resubmit', allowedRoles: ['seller'] },
  { from: 'active', to: 'sold', action: 'markSold', allowedRoles: ['seller', 'admin'] },
  { from: 'active', to: 'delisted', action: 'delist', allowedRoles: ['seller', 'admin'] },
  { from: 'delisted', to: 'pending', action: 'relist', allowedRoles: ['seller'] },
]

/**
 * Check whether a status transition is valid for the given user role.
 */
export function canTransition(
  from: ListingStatus,
  to: ListingStatus,
  userRole: 'seller' | 'admin'
): boolean {
  const transition = TRANSITIONS.find(t => t.from === from && t.to === to)
  return transition?.allowedRoles.includes(userRole) ?? false
}

/**
 * Get all available actions for a listing in a given status, filtered by user role.
 */
export function getAvailableActions(
  status: ListingStatus,
  userRole: 'seller' | 'admin'
): { action: string; targetStatus: ListingStatus }[] {
  return TRANSITIONS
    .filter(t => t.from === status && t.allowedRoles.includes(userRole))
    .map(t => ({ action: t.action, targetStatus: t.to }))
}
