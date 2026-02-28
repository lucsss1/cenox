import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import * as M from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private pageParams(page: number, size: number = 10): HttpParams {
    return new HttpParams().set('page', page).set('size', size);
  }

  // Categorias
  getCategoriasPublico(): Observable<M.Categoria[]> { return this.http.get<M.Categoria[]>(`${this.api}/categorias/publico`); }
  getCategorias(page: number): Observable<M.Page<M.Categoria>> { return this.http.get<M.Page<M.Categoria>>(`${this.api}/categorias`, { params: this.pageParams(page) }); }
  createCategoria(r: M.CategoriaRequest): Observable<M.Categoria> { return this.http.post<M.Categoria>(`${this.api}/categorias`, r); }
  updateCategoria(id: number, r: M.CategoriaRequest): Observable<M.Categoria> { return this.http.put<M.Categoria>(`${this.api}/categorias/${id}`, r); }
  deleteCategoria(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/categorias/${id}`); }

  // Cardapio (publico)
  getCardapio(page: number): Observable<M.Page<M.Prato>> { return this.http.get<M.Page<M.Prato>>(`${this.api}/cardapio`, { params: this.pageParams(page, 12) }); }
  getCardapioCategoria(categoriaId: number, page: number): Observable<M.Page<M.Prato>> { return this.http.get<M.Page<M.Prato>>(`${this.api}/cardapio/categoria/${categoriaId}`, { params: this.pageParams(page, 12) }); }

  // Pratos
  getPratos(page: number): Observable<M.Page<M.Prato>> { return this.http.get<M.Page<M.Prato>>(`${this.api}/pratos`, { params: this.pageParams(page) }); }
  createPrato(r: M.PratoRequest): Observable<M.Prato> { return this.http.post<M.Prato>(`${this.api}/pratos`, r); }
  updatePrato(id: number, r: M.PratoRequest): Observable<M.Prato> { return this.http.put<M.Prato>(`${this.api}/pratos/${id}`, r); }
  ativarPrato(id: number): Observable<void> { return this.http.patch<void>(`${this.api}/pratos/${id}/ativar`, {}); }
  deletePrato(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/pratos/${id}`); }

  // Insumos
  getInsumos(page: number): Observable<M.Page<M.Insumo>> { return this.http.get<M.Page<M.Insumo>>(`${this.api}/insumos`, { params: this.pageParams(page) }); }
  getInsumosEstoqueBaixo(): Observable<M.Insumo[]> { return this.http.get<M.Insumo[]>(`${this.api}/insumos/estoque-baixo`); }
  createInsumo(r: M.InsumoRequest): Observable<M.Insumo> { return this.http.post<M.Insumo>(`${this.api}/insumos`, r); }
  updateInsumo(id: number, r: M.InsumoRequest): Observable<M.Insumo> { return this.http.put<M.Insumo>(`${this.api}/insumos/${id}`, r); }
  deleteInsumo(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/insumos/${id}`); }

  // Fichas Tecnicas
  getFichasTecnicas(page: number): Observable<M.Page<M.FichaTecnica>> { return this.http.get<M.Page<M.FichaTecnica>>(`${this.api}/fichas-tecnicas`, { params: this.pageParams(page) }); }
  getFichaTecnica(id: number): Observable<M.FichaTecnica> { return this.http.get<M.FichaTecnica>(`${this.api}/fichas-tecnicas/${id}`); }
  createFichaTecnica(r: M.FichaTecnicaRequest): Observable<M.FichaTecnica> { return this.http.post<M.FichaTecnica>(`${this.api}/fichas-tecnicas`, r); }
  updateFichaTecnica(id: number, r: M.FichaTecnicaRequest): Observable<M.FichaTecnica> { return this.http.put<M.FichaTecnica>(`${this.api}/fichas-tecnicas/${id}`, r); }
  deleteFichaTecnica(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/fichas-tecnicas/${id}`); }

  // Pedidos
  getPedidos(page: number): Observable<M.Page<M.Pedido>> { return this.http.get<M.Page<M.Pedido>>(`${this.api}/pedidos`, { params: this.pageParams(page) }); }
  getMeusPedidos(page: number): Observable<M.Page<M.Pedido>> { return this.http.get<M.Page<M.Pedido>>(`${this.api}/pedidos/meus`, { params: this.pageParams(page) }); }
  getPedidosPorStatus(status: string, page: number): Observable<M.Page<M.Pedido>> { return this.http.get<M.Page<M.Pedido>>(`${this.api}/pedidos/status/${status}`, { params: this.pageParams(page) }); }
  createPedido(r: M.PedidoRequest): Observable<M.Pedido> { return this.http.post<M.Pedido>(`${this.api}/pedidos`, r); }
  alterarStatusPedido(id: number, status: string): Observable<M.Pedido> { return this.http.patch<M.Pedido>(`${this.api}/pedidos/${id}/status?status=${status}`, {}); }

  // Fornecedores
  getFornecedores(page: number): Observable<M.Page<M.Fornecedor>> { return this.http.get<M.Page<M.Fornecedor>>(`${this.api}/fornecedores`, { params: this.pageParams(page) }); }
  getFornecedoresTodos(): Observable<M.Fornecedor[]> { return this.http.get<M.Fornecedor[]>(`${this.api}/fornecedores/todos`); }
  createFornecedor(r: M.FornecedorRequest): Observable<M.Fornecedor> { return this.http.post<M.Fornecedor>(`${this.api}/fornecedores`, r); }
  updateFornecedor(id: number, r: M.FornecedorRequest): Observable<M.Fornecedor> { return this.http.put<M.Fornecedor>(`${this.api}/fornecedores/${id}`, r); }
  deleteFornecedor(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/fornecedores/${id}`); }

  // Compras
  getCompras(page: number): Observable<M.Page<M.Compra>> { return this.http.get<M.Page<M.Compra>>(`${this.api}/compras`, { params: this.pageParams(page) }); }
  createCompra(r: M.CompraRequest): Observable<M.Compra> { return this.http.post<M.Compra>(`${this.api}/compras`, r); }

  // Usuarios
  getUsuarios(page: number): Observable<M.Page<M.Usuario>> { return this.http.get<M.Page<M.Usuario>>(`${this.api}/usuarios`, { params: this.pageParams(page) }); }
  createUsuario(r: M.UsuarioRequest): Observable<M.Usuario> { return this.http.post<M.Usuario>(`${this.api}/usuarios`, r); }
  deleteUsuario(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/usuarios/${id}`); }

  // Dashboard
  getDashboard(): Observable<M.Dashboard> { return this.http.get<M.Dashboard>(`${this.api}/dashboard`); }
}
