export const AppPermissions = {
  Scouting: {
    Create: 'Permissions.Scouting.Create',
    View: 'Permissions.Scouting.View',
    Edit: 'Permissions.Scouting.Edit',
  },

  Control: {
    Execute: 'Permissions.Control.Execute',
    View: 'Permissions.Control.View',
  },

  Evaluation: {
    Approve: 'Permissions.Evaluation.Approve',
    Reject: 'Permissions.Evaluation.Reject',
  },

  Users: {
    Create: 'Permissions.Users.Create',
    View: 'Permissions.Users.View',
    Edit: 'Permissions.Users.Edit',
    Delete: 'Permissions.Users.Delete',
  },

  Permission: {
    View: 'Permissions.Permission.View',
    Create: 'Permissions.Permission.Create',
    Edit: 'Permissions.Permission.Edit',
    Delete: 'Permissions.Permission.Delete',
  },

  Roles: {
    View: 'Permissions.Roles.View',
    Create: 'Permissions.Roles.Create',
    Edit: 'Permissions.Roles.Edit',
    Delete: 'Permissions.Roles.Delete',
  },

  Pest: {
    View: 'Permissions.Pest.View',
    Create: 'Permissions.Pest.Create',
    Edit: 'Permissions.Pest.Edit',
    Delete: 'Permissions.Pest.Delete',
  },

  Pesticide: {
    View: 'Permissions.Pesticide.View',
    Create: 'Permissions.Pesticide.Create',
    Edit: 'Permissions.Pesticide.Edit',
    Delete: 'Permissions.Pesticide.Delete',
  },

  Region: {
    View: 'Permissions.Region.View',
    Create: 'Permissions.Region.Create',
    Edit: 'Permissions.Region.Edit',
    Delete: 'Permissions.Region.Delete',
  },

  Area: {
    View: 'Permissions.Area.View',
    Create: 'Permissions.Area.Create',
    Edit: 'Permissions.Area.Edit',
    Delete: 'Permissions.Area.Delete',
  },

  Inventory: {
    View: 'Permissions.Inventory.View',
    Mix: 'Permissions.Inventory.Mix',
    Consume: 'Permissions.Inventory.Consume',
    Check: 'Permissions.Inventory.Check',
  },
} as const;

// Type helper to extract all permission values
export type AppPermissionsType = typeof AppPermissions;

// Helper to get all permissions as a flat array
export const ALL_PERMISSIONS_LIST = Object.values(AppPermissions)
  .flatMap(group => Object.values(group)) as string[];
