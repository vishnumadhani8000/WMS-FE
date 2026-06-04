import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AddToCartDto,
  CartResponseDto,
  UpdateCartItemQuantityDto
} from '../models/cart.model';

import { environment } from '../../../../../environments/environment';

import { ApiResponse } from '../../../../core/models/api-responce.model';
import { AddressData } from '../../address/models/addresh.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl =`${environment.baseUrl}`;

  // GET CURRENT USER CART
  getCart(): Observable<ApiResponse<CartResponseDto>> {
    return this.http.get<ApiResponse<CartResponseDto>>(`${this.baseUrl}/cart`);
  }

  // ADD TO CART
  addToCart(
    dto: AddToCartDto
  ): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      `${this.baseUrl}/cart/add`,
      dto
    );
  }

  // UPDATE QUANTITY
  updateQuantity(
    cartItemId: number,
    dto: UpdateCartItemQuantityDto
  ): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(
      `${this.baseUrl}/cart/items/${cartItemId}/quantity`,
      dto
    );
  }

  // DELETE CART ITEM
  deleteCartItem(
    cartItemId: number
  ): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.baseUrl}/cart/items/${cartItemId}`
    );
  }

  // PLACE ORDER
  placeOrder(): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      `${environment.baseUrl}/cart/orders`,
      {}
    );
  }
  getUserAddresses(): Observable<ApiResponse<AddressData[]>> {
    return this.http.get<ApiResponse<AddressData[]>>(
      `${this.baseUrl}/user-addresses`
    );
  }
}