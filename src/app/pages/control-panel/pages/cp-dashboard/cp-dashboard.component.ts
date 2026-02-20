import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WeatherForecastService } from '../../../../core/services/weather-forecast.service';
import { ReportsService } from '../../../../core/services/reports.service';

@Component({
    selector: 'app-cp-dashboard',
    standalone: true,
    imports: [CommonModule, TranslateModule, ChartModule, ButtonModule],
    templateUrl: './cp-dashboard.component.html',
    styleUrls: ['./cp-dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CpDashboardComponent {
    private weatherForecastService = inject(WeatherForecastService);
    private reportsService = inject(ReportsService);
    private translate = inject(TranslateService);

    weatherForecasts = toSignal(
        this.weatherForecastService.getForecast().pipe(catchError(() => of([]))),
        { initialValue: [] }
    );

    scoutPerformance = toSignal(
        this.reportsService.getScoutPerformance().pipe(catchError(() => of([]))),
        { initialValue: [] }
    );

    infestationReport = toSignal(
        this.reportsService.getInfestation().pipe(catchError(() => of([]))),
        { initialValue: [] }
    );

    // Computed stats based on real data
    stats = computed(() => {
        const perf = this.scoutPerformance();
        const infestation = this.infestationReport();

        const totalReports = perf.reduce((acc, curr) => acc + curr.totalReports, 0);
        const alerts = infestation.reduce((acc, curr) => acc + curr.incidenceCount, 0);
        // Mocking other stats for now as they require other endpoints or complex logic
        const efficiency = 94.2;

        return [
            {
                label: 'dashboard.stats.total_ops',
                value: totalReports.toLocaleString(),
                trend: '+12%', // Mock trend
                trendUp: true,
                icon: 'pi-server',
                bgClass: 'bg-brand-500',
                iconBgClass: 'bg-brand-50',
                iconColorClass: 'text-brand-600'
            },
            {
                label: 'dashboard.stats.active_sites',
                value: '84', // Mock
                trend: '+4%',
                trendUp: true,
                icon: 'pi-map-marker',
                bgClass: 'bg-emerald-500',
                iconBgClass: 'bg-emerald-50',
                iconColorClass: 'text-emerald-600'
            },
            {
                label: 'dashboard.stats.alerts',
                value: alerts.toLocaleString(),
                trend: '-2%',
                trendUp: true,
                icon: 'pi-exclamation-circle',
                bgClass: 'bg-orange-500',
                iconBgClass: 'bg-orange-50',
                iconColorClass: 'text-orange-600'
            },
            {
                label: 'dashboard.stats.efficiency',
                value: `${efficiency}%`,
                trend: '+1.5%',
                trendUp: true,
                icon: 'pi-chart-line',
                bgClass: 'bg-violet-500',
                iconBgClass: 'bg-violet-50',
                iconColorClass: 'text-violet-600'
            }
        ];
    });

    chartsData = signal({
        pestDist: {
            labels: ['Rodents', 'Insects', 'Reptiles'],
            datasets: [
                {
                    data: [30, 50, 20],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }
            ]
        },
        efficiency: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Efficiency',
                    data: [65, 59, 80, 81, 56, 55],
                    fill: false,
                    borderColor: '#4bc0c0'
                }
            ]
        }
    });

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
}
