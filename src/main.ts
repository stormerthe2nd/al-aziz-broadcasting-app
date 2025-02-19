<<<<<<< HEAD
import {
  bootstrapApplication,
  provideNativeScriptHttpClient,
  provideNativeScriptNgZone,
  provideNativeScriptRouter,
  runNativeScriptAngularApp,
} from '@nativescript/angular';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

/**
 * Disable zone by setting this to true
 * Then also adjust polyfills.ts (see note there)
 */
const EXPERIMENTAL_ZONELESS = false;

runNativeScriptAngularApp({
  appModuleBootstrap: () => {
    return bootstrapApplication(AppComponent, {
      providers: [
        provideNativeScriptHttpClient(withInterceptorsFromDi()),
        provideNativeScriptRouter(routes),
        EXPERIMENTAL_ZONELESS
          ? provideExperimentalZonelessChangeDetection()
          : provideNativeScriptNgZone(),
      ],
    });
  },
});
=======
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
>>>>>>> 0ef477eeedc6c23ffdd1b1a44fb4b7cbb5ea6a26
