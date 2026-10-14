import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `<section class="container"><h2 class="title">404 – Página no encontrada</h2><p>Lo sentimos, la página que buscas no existe.</p></section>`,
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {}
