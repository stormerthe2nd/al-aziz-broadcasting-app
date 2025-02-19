<<<<<<< HEAD
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { PageRouterOutlet } from '@nativescript/angular';

@Component({
  selector: 'ns-app',
  templateUrl: './app.component.html',
  imports: [PageRouterOutlet],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppComponent {}
=======
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'al-aziz';
}
>>>>>>> 0ef477eeedc6c23ffdd1b1a44fb4b7cbb5ea6a26
