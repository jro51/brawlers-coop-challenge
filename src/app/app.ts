import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RetoCoop } from './interfaces/reto-coop';
import { RetoService } from './services/reto-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  retoActual: RetoCoop | null = null;
  girando: boolean = false;

  // Inyectamos ChangeDetectorRef para obligar a Angular a refrescar el HTML
  constructor(
    private retoService: RetoService,
    private cdr: ChangeDetectorRef
  ) {}

  onGirarRuleta() {
    if (this.girando) return;

    this.girando = true;
    let giros = 0;
    const maxGiros = 15;

    // Generamos un primer reto inmediatamente para que rompa el '@else' 
    // del HTML y la tarjeta aparezca en pantalla al instante.
    const primerReto = this.retoService.generarReto();
    if (primerReto) {
      this.retoActual = primerReto;
    }

    const intervalo = setInterval(() => {
      const nuevoReto = this.retoService.generarReto();
      
      if (nuevoReto) {
        this.retoActual = nuevoReto;
      }
      
      giros++;

      // Obligamos a Angular a renderizar el cambio en cada iteración
      this.cdr.detectChanges();

      if (giros >= maxGiros) {
        clearInterval(intervalo);
        this.girando = false;
        this.cdr.detectChanges(); // Refresco final para habilitar el botón
      }
    }, 100);
  }
}
