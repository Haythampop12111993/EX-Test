import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-cp-dashboard',
    standalone: true,
    imports: [CommonModule, TranslateModule, ChartModule, ButtonModule],
    templateUrl: './cp-dashboard.component.html',
    styleUrls: ['./cp-dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CpDashboardComponent {
    private mockService = inject(MockDataService);

    chartsData = toSignal(this.mockService.getDashboardCharts());

    doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: '#64748b',
                    font: { family: "'Cairo', sans-serif", size: 13 },
                    padding: 20
                },
                position: 'bottom'
            }
        },
        layout: { padding: 0 }
    };

    lineOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: '#64748b'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false
                }
            }
        },
        tension: 0.4
    };

    stats = [
        {
            label: 'dashboard.stats.total_ops',
            value: '1,245',
            trend: '+12%',
            trendUp: true,
            icon: 'pi-server',
            bgClass: 'bg-brand-500',
            iconBgClass: 'bg-brand-50',
            iconColorClass: 'text-brand-600'
        },
        {
            label: 'dashboard.stats.active_sites',
            value: '84',
            trend: '+4%',
            trendUp: true,
            icon: 'pi-map-marker',
            bgClass: 'bg-emerald-500',
            iconBgClass: 'bg-emerald-50',
            iconColorClass: 'text-emerald-600'
        },
        {
            label: 'dashboard.stats.alerts',
            value: '12',
            trend: '-2%',
            trendUp: true, // actually good that alerts are down
            icon: 'pi-exclamation-circle',
            bgClass: 'bg-orange-500',
            iconBgClass: 'bg-orange-50',
            iconColorClass: 'text-orange-600'
        },
        {
            label: 'dashboard.stats.efficiency',
            value: '94.2%',
            trend: '+1.5%',
            trendUp: true,
            icon: 'pi-chart-line',
            bgClass: 'bg-violet-500',
            iconBgClass: 'bg-violet-50',
            iconColorClass: 'text-violet-600'
        }
    ];
}
