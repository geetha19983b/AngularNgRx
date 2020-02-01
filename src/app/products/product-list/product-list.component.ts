import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription, Observable } from 'rxjs';

import { Product } from '../product';
import { ProductService } from '../product.service';
import { Store,select } from '@ngrx/store';
import * as fromProduct from '../state/product.reducer';
import * as productActions from '../state/product.actions';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  pageTitle = 'Products';
  //errorMessage: string;
  errorMessage$: Observable<string>;
  componentActive = true;

  displayCode: boolean;

  //products: Product[];
  products$: Observable<Product[]>;

  // Used to highlight the selected product in the list
  selectedProduct: Product | null;
  sub: Subscription;

  constructor(private store: Store<fromProduct.State>,private productService: ProductService) { }

  ngOnInit(): void {
    /* this.sub = this.productService.selectedProductChanges$.subscribe(
      selectedProduct => this.selectedProduct = selectedProduct
    ); 
    this.store.pipe(select(fromProduct.getCurrentProduct)).subscribe(
      currentProduct => this.selectedProduct = currentProduct
    );*/

    /* this.productService.getProducts().subscribe({
      next: (products: Product[]) => this.products = products,
      error: (err: any) => this.errorMessage = err.error
    }); */
    this.products$ = this.store.pipe(select(fromProduct.getProducts)) as Observable<Product[]>;
    // Do NOT subscribe here because it used an async pipe
    this.errorMessage$ = this.store.pipe(select(fromProduct.getError));

    this.store.dispatch(new productActions.Load());

    // Subscribe here because it does not use an async pipe
    this.store.pipe(
      select(fromProduct.getCurrentProduct),
      takeWhile(() => this.componentActive)
    ).subscribe(
      currentProduct => this.selectedProduct = currentProduct
    );

     // TODO: Unsubscribe
     /* this.store.pipe(select('products')).subscribe(
      products => {
        if (products) {
          this.displayCode = products.showProductCode;
        }
      }); */
      this.store.pipe(select(fromProduct.getShowProductCode)).subscribe(
        showProductCode => this.displayCode = showProductCode
      );
  }

  ngOnDestroy(): void {
    //this.sub.unsubscribe();
    this.componentActive = false;
  }

  checkChanged(value: boolean): void {
    //this.displayCode = value;
    /* this.store.dispatch({
      type: 'TOGGLE_PRODUCT_CODE',
      payload: value
    }); */
    this.store.dispatch(new productActions.ToggleProductCode(value));
  }

  newProduct(): void {
    //this.productService.changeSelectedProduct(this.productService.newProduct());
    this.store.dispatch(new productActions.InitializeCurrentProduct());
  }

  productSelected(product: Product): void {
   // this.productService.changeSelectedProduct(product);
   this.store.dispatch(new productActions.SetCurrentProduct(product));
  }

}
