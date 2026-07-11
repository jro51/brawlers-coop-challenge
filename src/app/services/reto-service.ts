import { Injectable } from '@angular/core';
import { RetoCoop } from '../interfaces/reto-coop';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RetoService {
  private apiUrl = 'https://api.brawlapi.com/v1';
  
  private brawlers: any[] = [];
  private modos: any[] = []; // Ahora la API llenará esta lista automáticamente

  private condiciones: string[] = [
    'Sin usar la habilidad Súper',
    'Prohibido usar Gadgets',
    'El primero en morir debe dar 3 vueltas en su mismo lugar',
    'Solo se permite usar ataque automático',
    'No pueden separarse en todo el mapa',
    'Prohibido quedarse quieto por más de 2 segundos',
    'Escogeran la primera estelar del brawler que le salió',
    'Sin usar la hipercarga'
  ];

  constructor(private http: HttpClient) {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
  try {
    const [resBrawlers, resModos]: any = await Promise.all([
      firstValueFrom(this.http.get(`${this.apiUrl}/brawlers`)),
      firstValueFrom(this.http.get(`${this.apiUrl}/gamemodes`))
    ]);

    this.brawlers = resBrawlers.list;

    // IDs o nombres en minúsculas de los modos comunes que queremos mantener
    const modosPermitidos = ['gemgrab', 'gem-grab', 'brawlball', 'brawl-ball', 'knockout', 'hotzone', 'hot-zone', 'heist', 'bounty', 'showdown'];

    // Filtramos de forma más flexible
    this.modos = resModos.list.filter((modo: any) => {
      const nombreMin = modo.name ? modo.name.toLowerCase() : '';
      const scrimMin = modo.scrim ? modo.scrim.toLowerCase() : '';
      
      return modosPermitidos.some(p => nombreMin.includes(p) || scrimMin.includes(p));
    });

    // ¡PLAN B DE SEGURIDAD! Si el filtro fue demasiado estricto y quedó vacío, 
    // usamos toda la lista de la API para que la aplicación NO se rompa.
    if (this.modos.length === 0) {
      console.warn('El filtro de modos no coincidió. Usando modos por defecto.');
      this.modos = resModos.list;
    }

  } catch (error) {
    console.error('Error al conectar con BrawlAPI:', error);
  }
}

generarReto(): RetoCoop | null {
  // Si por alguna razón sigue vacío, evitamos el bloqueo regresando un objeto genérico de respaldo
  if (this.brawlers.length === 0 || this.modos.length === 0) {
    return {
      brawlerTu: 'Shelly',
      imageUrlTu: 'https://cdn.brawlify.com/brawlers/borderless/shelly.png',
      brawlerElla: 'Colt',
      imageUrlElla: 'https://cdn.brawlify.com/brawlers/borderless/colt.png',
      modoJuego: 'Balón Brawl',
      imageUrlModo: 'https://cdn.brawlify.com/game-modes/regular/brawl-ball.png',
      condicion: 'Cargando datos...'
    };
  }

  const tuBrawler = this.brawlers[Math.floor(Math.random() * this.brawlers.length)];
  let ellaBrawler = this.brawlers[Math.floor(Math.random() * this.brawlers.length)];

  while (tuBrawler.id === ellaBrawler.id) {
    ellaBrawler = this.brawlers[Math.floor(Math.random() * this.brawlers.length)];
  }

  const modoAleatorio = this.modos[Math.floor(Math.random() * this.modos.length)];
  
  // CORREGIDO: Cambiado 'this.conditions' por 'this.condiciones'
  const condicionAleatoria = this.condiciones[Math.floor(Math.random() * this.condiciones.length)];

  return {
    brawlerTu: tuBrawler.name,
    imageUrlTu: tuBrawler.imageUrl,
    brawlerElla: ellaBrawler.name,
    imageUrlElla: ellaBrawler.imageUrl,
    modoJuego: modoAleatorio.name,
    imageUrlModo: modoAleatorio.imageUrl,
    condicion: condicionAleatoria
  };
}
}
