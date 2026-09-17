/**
 * D3 Progressive Navigation & Governed Workspace primitives
 * Enforces pure navigation context without creating or validating backend state.
 */

export interface GovernedRef {
  objectType: string;
  objectId: string;
}

export interface NavigationContext {
  primary: GovernedRef;
  parent?: GovernedRef;
  depth: 1 | 2 | 3;
  mode: 'current' | 'historical';
}

/**
 * Creates a stable navigation reference.
 */
export function createGovernedRef(objectType: string, objectId: string): GovernedRef {
  return { objectType, objectId };
}

/**
 * Initializes a new workspace context at depth 1.
 */
export function createPrimaryContext(
  ref: GovernedRef,
  mode: 'current' | 'historical' = 'current'
): NavigationContext {
  return {
    primary: ref,
    depth: 1,
    mode,
  };
}

/**
 * Creates a deeper context revealing related information (Level 2 or 3)
 * while preserving the primary object focus.
 */
export function createNestedContext(
  primary: GovernedRef,
  targetDepth: 2 | 3,
  parent?: GovernedRef,
  mode: 'current' | 'historical' = 'current'
): NavigationContext {
  return {
    primary,
    parent,
    depth: targetDepth,
    mode,
  };
}
