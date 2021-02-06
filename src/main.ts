import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

export const isEmpty = (obj) => {
  return !obj || (Array.isArray(obj) && obj.length < 1) || (Object.keys(obj).length < 1 && obj.constructor === Object);
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
