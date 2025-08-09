import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: any = {};
  private configLoaded = false;

  constructor(private http: HttpClient) {}

  initialize(): Promise<void> {
    return this.http
      .get('/assets/config.json')
      .toPromise()
      .then((config: any) => {
        this.config = config;
        this.configLoaded = true;
      })
      .catch(() => {
        console.warn('Failed to load config.json, using defaults');
        this.config = {
          apiUrl: 'http://localhost:5000/graphql',
        };
        this.configLoaded = true;
      });
  }

  getApiUrl(): string {
    if (!this.configLoaded) {
      console.warn('Config not loaded yet, returning default URL');
      return 'http://localhost:5000/graphql';
    }
    return this.config.apiUrl;
  }
}
