import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import { environment } from 'src/environments/environment';
// import Swiper JS
import Swiper from 'swiper';
// import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { ProductImagePipe } from '../../pipes/product-image.pipe';

const baseUrl = environment.baseUrl;

@Component({
  selector: 'product-carousel',
  imports: [ProductImagePipe],
  templateUrl: './product-carousel.component.html',
  styles: `
    .swiper {
      width: 100%;
      height: 500px;
    }
  `,
})
export class ProductCarouselComponent implements AfterViewInit, OnChanges {
  images = input.required<string[]>();

  // La propiedad swiperDiv utiliza el decorador viewChild para obtener una referencia
  // al elemento DOM identificado como #swiperDiv en la plantilla. Esto se usará
  // para inicializar o manipular dinámicamente el carrusel de imágenes (Swiper).
  swiperDiv = viewChild.required<ElementRef>('swiperDiv');

  swiper: Swiper | undefined = undefined;

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (changes['images'].firstChange) {
      return;
    }
    if ( !this.swiper ) return;
    this.swiper.destroy(true, true);

    const paginationEl: HTMLDivElement = this.swiperDiv().nativeElement?.querySelector('.swiper-pagination');

    paginationEl.innerHTML = '';

    setTimeout(() => {
      this.swiperInit()
    },100)
  }

  ngAfterViewInit(): void {
    this.swiperInit();
  }

  swiperInit() {
    const element = this.swiperDiv().nativeElement;
    if (!element) return;

    this.swiper = new Swiper(element, {
      // Optional parameters
      direction: 'horizontal',
      loop: true,
      modules: [Navigation, Pagination],

      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
      },

      // Navigation arrows
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // And if we need scrollbar
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });
  }
}
