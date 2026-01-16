import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ChartData {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor?: string | string[] }[];
}

export interface OperationRecord {
    id: string;
    siteName: string;
    date: string;
    type: 'Scouting' | 'Control';
    status: 'Pending' | 'In Progress' | 'Completed';
    technician: string;
}

@Injectable({
    providedIn: 'root'
})
export class MockDataService {



    getDashboardCharts(): Observable<{ pestDist: ChartData, efficiency: ChartData }> {
        const data = {
            pestDist: {
                labels: ['Rodents', 'Insects', 'Termites', 'Other'],
                datasets: [{
                    label: 'Pest Distribution',
                    data: [30, 50, 15, 5],
                    backgroundColor: ['#6366f1', '#10b981', '#f43f5e', '#8b5cf6']
                }]
            },
            efficiency: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    { 
                        label: 'Tasks Completed', 
                        data: [65, 59, 80, 81, 56, 95], 
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    { 
                        label: 'Issues Reported', 
                        data: [28, 48, 40, 19, 86, 27], 
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            }
        };
        return of(data).pipe(delay(500)); // Simulate API latency
    }

    getScoutingOps(): Observable<OperationRecord[]> {
        const data: OperationRecord[] = [
            { id: 'SC-101', siteName: 'Warehouse A', date: '2026-01-10', type: 'Scouting', status: 'Completed', technician: 'Ahmed Ali' },
            { id: 'SC-102', siteName: 'Office HQ', date: '2026-01-12', type: 'Scouting', status: 'In Progress', technician: 'Sara Smith' },
            { id: 'SC-103', siteName: 'Factory B', date: '2026-01-13', type: 'Scouting', status: 'Pending', technician: 'Mohamed Zaki' },
            { id: 'SC-104', siteName: 'Warehouse C', date: '2026-01-14', type: 'Scouting', status: 'Completed', technician: 'Ahmed Ali' },
            { id: 'SC-105', siteName: 'Retail Outlet', date: '2026-01-15', type: 'Scouting', status: 'Pending', technician: 'Sara Smith' },
        ];
        return of(data).pipe(delay(600));
    }

    getControlOps(): Observable<OperationRecord[]> {
        const data: OperationRecord[] = [
            { id: 'CT-201', siteName: 'Warehouse A', date: '2026-01-11', type: 'Control', status: 'Completed', technician: 'Team Alpha' },
            { id: 'CT-202', siteName: 'Factory B', date: '2026-01-14', type: 'Control', status: 'In Progress', technician: 'Team Beta' },
            { id: 'CT-203', siteName: 'Kitchen 1', date: '2026-01-14', type: 'Control', status: 'Pending', technician: 'Team Alpha' },
        ];
        return of(data).pipe(delay(600));
    }
}
