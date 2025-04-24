import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'shared-pagination',
  imports: [
    RouterLink
  ],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  pages = input<number>(0);
  currentPage = input<number>(1);
  // Utilizamos esta señal para actualizar el
  // estado de la señarl que llega del padre mediante el input curretnPage
  activePage = linkedSignal(this.currentPage)

  getPagesList = computed(() => {
    return Array.from({ length: this.pages() }, (_, i) => i + 1);
  });
}
