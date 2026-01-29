export const AppPermissions = {
  // Scouting Permissions
  Scouting: {
    Create: 'Permissions.Scouting.Create',
    View: 'Permissions.Scouting.View',
    Edit: 'Permissions.Scouting.Edit',
  },

  // Control Permissions
  Control: {
    Execute: 'Permissions.Control.Execute',
    View: 'Permissions.Control.View',
  },

  // Evaluation Permissions
  Evaluation: {
    Approve: 'Permissions.Evaluation.Approve',
    Reject: 'Permissions.Evaluation.Reject',
  }
} as const;

// Type helper to extract all permission values
export type AppPermissionsType = typeof AppPermissions;

// Helper to get all permissions as a flat array
export const ALL_PERMISSIONS_LIST = Object.values(AppPermissions)
  .flatMap(group => Object.values(group)) as string[];
