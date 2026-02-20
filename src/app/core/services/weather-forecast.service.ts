import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WeatherForecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary?: string;
}

@Injectable({
    providedIn: 'root'
})
export class WeatherForecastService {
    private http = inject(HttpClient);

    getForecast(): Observable<WeatherForecast[]> {
        return this.http.get<WeatherForecast[]>(`${environment.domain}/WeatherForecast`);
    }
}
