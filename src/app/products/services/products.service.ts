// -----------------------------------------------------------------------------
// Importaciones
// -----------------------------------------------------------------------------
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import {
  Gender,
  Product,
  ProductsResponse,
} from '@products/interfaces/product.interface';
import { forkJoin, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

// --------------------------- Constantes --------------------------------------
const baseUrl = environment.baseUrl;

// --------------------------- Interfaces --------------------------------------
interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

// ------------------ Producto Vacío para creaciçon ----------------------------
const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User,
};

// ------------------------ Decorador Injectable ---------------------------------
@Injectable({ providedIn: 'root' })
export class ProductsService {
  // ----------------------- Inyección de dependencias ---------------------------
  private http = inject(HttpClient);

  // ---------------------------------------------------------------------------
  // Propiedades privadas
  // ---------------------------------------------------------------------------
  private productsCache = new Map<string, ProductsResponse>(); // Caché para listas de productos
  private productCache = new Map<string, Product>(); // Caché para productos individuales

  // ---------------------------------------------------------------------------
  // Métodos públicos
  // ---------------------------------------------------------------------------

  /**
   * Obtiene una lista de productos desde el servidor o desde el caché.
   * @param options Opciones para la consulta (limit, offset, gender).
   * @returns Observable con la respuesta de productos.
   */
  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;

    // Genera una clave única para el caché basada en los parámetros.
    const key = `${limit}-${offset}-${gender}`; // Ejemplo: "9-0-''"

    // Si la clave ya existe en el caché, devuelve los datos almacenados.
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    // Si no está en el caché, realiza una petición HTTP.
    return this.http
      .get<ProductsResponse>(`${baseUrl}/products`, {
        params: { limit, offset, gender },
      })
      .pipe(
        tap((resp) => console.log(resp)), // Debug: imprime la respuesta.
        tap((resp) => this.productsCache.set(key, resp)) // Guarda en el caché.
      );
  }

  /**
   * Obtiene un producto por su idSlug desde el servidor o desde el caché.
   * @param idSlug Identificador único del producto (slug).
   * @returns Observable con el producto.
   */
  getProductByIdSlug(idSlug: string): Observable<Product> {
    // Si el idSlug ya está en el caché, devuelve los datos almacenados.
    if (this.productCache.has(idSlug)) {
      return of(this.productCache.get(idSlug)!);
    }

    // Si no está en el caché, realiza una petición HTTP.
    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`).pipe(
      tap((product) => console.log(product)), // Debug: imprime el producto.
      tap((product) => this.productCache.set(idSlug, product)) // Guarda en el caché.
    );
  }

  /**
   * Obtiene un producto por su id desde el servidor o desde el caché.
   * @param id Identificador único del producto.
   * @returns Observable con el producto.
   */
  getProductById(id: string): Observable<Product> {
    if (id === 'new') {
      return of(emptyProduct);
    }

    // Si el id ya está en el caché, devuelve los datos almacenados.
    if (this.productCache.has(id)) {
      return of(this.productCache.get(id)!);
    }

    // Si no está en el caché, realiza una petición HTTP.
    return this.http.get<Product>(`${baseUrl}/products/${id}`).pipe(
      tap((product) => console.log(product)), // Debug: imprime el producto.
      tap((product) => this.productCache.set(id, product)) // Guarda en el caché.
    );
  }

  /**
   * Crea un producto en el servidor.
   */
  createProduct(productLike: Partial<Product>): Observable<Product> {
    return this.http
      .post<Product>(`${baseUrl}/products`, productLike)
      .pipe(tap((product) => this.updateproductCache(product)));
  }

  /**
   * Actualiza un producto en el servidor.
   * @param productLike Objeto parcial con los datos del producto a actualizar.
   */
  updateProduct(
    id: string,
    productLike: Partial<Product>
  ): Observable<Product> {
    console.log('Actualizando producto');
    // Lógica de actualización con HTTP PATCH.
    return this.http
      .patch<Product>(`${baseUrl}/products/${id}`, productLike)
      .pipe(tap((product) => this.updateproductCache(product))); // Después de una respuesta exitosa actualizamos los datos del caché
  }

  /**
   * Este metodo es para cuando se hace una actualizacion en un producto que no solamente quede
   * persistido en la BD sino que se actualicen los datos del caché y así disminuimos peticiones innecesarias
   */
  updateproductCache(product: Product) {
    const productId = product.id;
    this.productCache.set(productId, product);

    this.productsCache.forEach((productResponse) => {
      // Sobreescribimos el arreglo con la información actualizada
      productResponse.products = productResponse.products.map(
        (currentProduct) => {
          // Si se encuentra el id del producto que estamos actualizando se devuelve y sino no hacemos nada
          return currentProduct.id === productId ? product : currentProduct;
        }
      );
    });
  }

  uploadImages(images?: FileList): Observable<string[]> {
    if (!images) return of([]);

    const uploadObservables = Array.from(images).map((imageFile) =>
      this.uploadImage(imageFile)
    );
    //Esperamos a que se carguen todas las imagenes
    return forkJoin(uploadObservables);
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile);

    return this.http
      .post<{ fileName: string }>(`${baseUrl}/files/product`, formData)
      .pipe(map((resp) => resp.fileName));
  }
}
