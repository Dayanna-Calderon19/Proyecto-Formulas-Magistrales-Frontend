import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { LayoutService } from '../../core/services/layout.service';

/**
 * Componente contenedor principal del layout autenticado.
 * Integra de forma cohesiva la barra superior (Header), el menú lateral (Sidebar),
 * el área dinámica de navegación (RouterOutlet) y el pie de página (Footer).
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  readonly layoutService = inject(LayoutService);
}
