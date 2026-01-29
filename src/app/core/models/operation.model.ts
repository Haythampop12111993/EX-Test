export interface OperationRecord {
    id: string;
    siteName: string;
    date: string;
    type: 'Scouting' | 'Control';
    status: 'Pending' | 'In Progress' | 'Completed';
    technician: string;
}

export interface ScoutingOperation extends OperationRecord {
    // Add specific fields for scouting if any
}

export interface ControlOperation extends OperationRecord {
    // Add specific fields for control if any
}
