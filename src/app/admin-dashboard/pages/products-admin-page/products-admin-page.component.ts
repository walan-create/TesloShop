import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductTableComponent } from '@products/components/product-table/product-table.component';
import { ProductsService } from '@products/services/products.service';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { PaginationComponent } from "../../../shared/components/pagination/pagination.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-admin-page',
  imports: [
    ProductTableComponent,
    PaginationComponent,
    RouterLink
],
  templateUrl: './products-admin-page.component.html',
})
export class ProductsAdminPageComponent {


  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);
  productsPerPage = signal<number>(10);

  productsResource = rxResource({
    request: () => ({
      page: this.paginationService.currentPage() - 1,
      limit: this.productsPerPage(),
    }),
    loader: ({ request }) => {
      //observable que va a devolver la informacion
      return this.productsService.getProducts({
        offset: request.page * 9,
        limit: request. limit,
      });
    },
  });

  onItemsPerPageChange(event: Event): void {
    const selectedValue = parseInt((event.target as HTMLSelectElement).value, 10);
    this.productsPerPage.set(selectedValue); // Actualiza el signal
    this.productsResource.reload(); // Recarga los datos con el nuevo límite
  }

}
