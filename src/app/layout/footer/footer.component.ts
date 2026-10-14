import { Component } from '@angular/core';

/**
 * Componente Footer con año dinámico y datos de estado del sistema.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  readonly currentYear: number = new Date().getFullYear();
}
