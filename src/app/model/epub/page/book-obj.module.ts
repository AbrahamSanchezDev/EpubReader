import { PageModule } from './page.module';
import { SafeHtml } from '@angular/platform-browser';
import { ImgUrlData } from '../../../interface/img-url-data';

// 1. Eliminamos por completo el decorador @NgModule
export class BookObjModule {
  name = '';
  // 2. Usamos el operador ! o inicializamos para cumplir con el modo estricto
  pages: PageModule[] = [];
  index: SafeHtml = '';
  images: ImgUrlData[] = [];
  usePagesAsMenu = false;

  constructor() {
    // Los valores ya se inicializan arriba de forma más limpia
  }

  Init(): void {
    for (const page of this.pages) {
      page.getContentData();
    }
  }
}
