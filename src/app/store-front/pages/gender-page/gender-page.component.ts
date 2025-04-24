import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '@products/services/products.service';
import { map } from 'rxjs';
import { ProductCardComponent } from '../../../products/components/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PaginationService } from '@shared/components/pagination/pagination.service';

@Component({
  selector: 'app-gender-page',
  imports: [ProductCardComponent, PaginationComponent],
  templateUrl: './gender-page.component.html',
})
export class GenderPageComponent {
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);
  route = inject(ActivatedRoute);
  //Toma el género de la URL
  gender = toSignal(this.route.params.pipe(map(({ gender }) => gender)));

  productsResource = rxResource({
    request: () => ({
      gender: this.gender(),
      page: this.paginationService.currentPage() - 1,
    }),
    loader: ({ request }) => {
      //observable que va a devolver la informacion
      return this.productsService.getProducts({
        gender: request.gender,
        offset: request.page * 9,
      });
    },
  });
}
