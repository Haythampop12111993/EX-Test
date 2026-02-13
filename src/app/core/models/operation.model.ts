export interface OperationRecord {
    id: string;
    siteName: string;
    date: string;
    type: 'Scouting' | 'Control';
    status: 'Pending' | 'In Progress' | 'Completed';
    technician: string;
}

export type ScoutingOperation = OperationRecord;

export type ControlOperation = OperationRecord;
