export interface Pest {
    id: string;
    name: string;
    type: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Active' | 'Controlled' | 'Monitored';
    image?: string | File;
}
