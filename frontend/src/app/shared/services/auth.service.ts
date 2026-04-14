import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UsuarioRequest, Usuario, CartItem, Prato } from '../models/models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
      })
    );
  }

  registrar(request: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/auth/registrar`, request);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrinho');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): Usuario | null {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getUsuario();
    return user ? user.perfil === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getUsuario();
    return user ? roles.includes(user.perfil) : false;
  }

  // Cart management
  getCart(): CartItem[] {
    const data = localStorage.getItem('carrinho');
    return data ? JSON.parse(data) : [];
  }

  addToCart(prato: Prato, quantidade: number = 1): void {
    const cart = this.getCart();
    const existing = cart.find(i => i.prato.id === prato.id);
    if (existing) {
      existing.quantidade += quantidade;
    } else {
      cart.push({ prato, quantidade, observacao: '' });
    }
    localStorage.setItem('carrinho', JSON.stringify(cart));
  }

  removeFromCart(pratoId: number): void {
    const cart = this.getCart().filter(i => i.prato.id !== pratoId);
    localStorage.setItem('carrinho', JSON.stringify(cart));
  }

  clearCart(): void {
    localStorage.removeItem('carrinho');
  }

  getCartCount(): number {
    return this.getCart().reduce((sum, i) => sum + i.quantidade, 0);
  }

  getCartTotal(): number {
    return this.getCart().reduce((sum, i) => sum + i.prato.precoVenda * i.quantidade, 0);
  }
}
