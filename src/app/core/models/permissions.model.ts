export interface RoleClaim {
    type: string;
    value: string;
    isSelected: boolean;
}

export interface RolePermissionsDto {
    roleId: string;
    roleName: string;
    roleClaims: RoleClaim[];
}

export interface UpdatePermissionsRequest {
    roleId: string;
    roleClaims: RoleClaim[];
}
