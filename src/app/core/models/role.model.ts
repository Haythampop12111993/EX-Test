export interface Role {
    id: string;
    name: string;
}

export interface CreateRoleRequest {
    roleName: string;
}

export interface AssignRoleRequest {
    email: string;
    roleName: string;
}
