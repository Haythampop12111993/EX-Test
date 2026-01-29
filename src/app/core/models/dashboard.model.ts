export interface ChartData {
    labels: string[];
    datasets: { 
        label: string; 
        data: number[]; 
        backgroundColor?: string | string[];
        borderColor?: string;
        fill?: boolean;
        tension?: number;
    }[];
}

export interface DashboardStats {
    pestDist: ChartData;
    efficiency: ChartData;
}
