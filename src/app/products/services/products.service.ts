import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Product,
  ProductsResponse,
} from '@products/interfaces/product.interface';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  private productsCache = new Map<string, ProductsResponse>();
  private productCache = new Map<string, Product>();

  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;

    const key = `${limit}-${offset}-${gender}`; // 9-0-''
    if (this.productsCache.has(key)) {
      //El of es una función creadora de Observables de RxJs
      return of(this.productsCache.get(key)!);
    }

    return this.http
      .get<ProductsResponse>(`${baseUrl}/products`, {
        params: {
          limit,
          offset,
          gender,
        },
      })
      .pipe(
        tap((resp) => console.log(resp)),
        tap((resp) => this.productsCache.set(key, resp))
      );
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    //Si el idSlug ya ha sido registrado en la lista se devuelve la data del caché correspondiente
    if (this.productCache.has(idSlug)) {
      return of(this.productCache.get(idSlug)!);
    }

    //Si no se encuentra en caché lanza una petición
    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`).pipe(
      tap((product) => console.log(product)), //Imprimimos para debuggear
      tap((product) => this.productCache.set(idSlug, product)) //Guardamos en el caché la data de la consulta
    );
  }
}
