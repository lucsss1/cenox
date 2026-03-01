export interface LoginRequest { email: string; senha: string; }
export interface LoginResponse { token: string; tipo: string; usuario: Usuario; }
export interface UsuarioRequest { nome: string; email: string; senha: string; perfil: string; }

export interface Usuario {
  id: number; nome: string; email: string;
  perfil: 'ADMIN' | 'GERENTE' | 'COZINHEIRO' | 'CLIENTE';
  status: string; createdAt: string;
}

export interface Categoria { id: number; nome: string; descricao: string; status: string; }
export interface CategoriaRequest { nome: string; descricao: string; }

export interface Prato {
  id: number; nome: string; descricao: string;
  precoVenda: number; custoProducao: number; foodCost: number;
  tempoPreparo: number; imagemUrl: string;
  categoriaId: number; categoriaNome: string;
  temFichaTecnica: boolean; foodCostAlto: boolean; status: string;
}
export interface PratoRequest {
  nome: string; descricao: string; precoVenda: number;
  tempoPreparo: number; imagemUrl: string; categoriaId: number;
}

export interface Insumo {
  id: number; nome: string; unidadeMedida: string;
  quantidadeEstoque: number; estoqueMinimo: number;
  custoMedio: number; abaixoEstoqueMinimo: boolean; status: string;
}
export interface InsumoRequest {
  nome: string; unidadeMedida: string;
  estoqueMinimo: number; custoMedio: number;
}

export interface FichaTecnica {
  id: number; pratoId: number; pratoNome: string;
  rendimento: number; custoTotal: number;
  custoPorPorcao: number; foodCost: number;
  itens: ItemFichaTecnica[]; status: string;
}
export interface ItemFichaTecnica {
  id: number; insumoId: number; insumoNome: string;
  unidadeMedida: string; quantidadeBruta: number;
  fatorCorrecao: number; quantidadeLiquida: number; custoItem: number;
}
export interface FichaTecnicaRequest {
  pratoId: number; rendimento: number;
  itens: { insumoId: number; quantidadeBruta: number; fatorCorrecao: number; }[];
}

export interface Pedido {
  id: number; clienteId: number; clienteNome: string;
  statusPedido: string; total: number; observacao: string;
  motivoCancelamento: string;
  itens: ItemPedido[]; createdAt: string;
}
export interface ItemPedido {
  id: number; pratoId: number; pratoNome: string;
  quantidade: number; precoUnitario: number;
  subtotal: number; observacao: string;
}
export interface PedidoRequest {
  observacao: string;
  itens: { pratoId: number; quantidade: number; observacao: string; }[];
}

export interface Fornecedor {
  id: number; razaoSocial: string; cnpj: string;
  email: string; telefone: string; endereco: string; status: string;
}
export interface FornecedorRequest {
  razaoSocial: string; cnpj: string; email: string;
  telefone: string; endereco: string;
}

export interface Compra {
  id: number; fornecedorId: number; fornecedorNome: string;
  dataCompra: string; notaFiscal: string; valorTotal: number;
  itens: ItemCompra[]; status: string;
}
export interface ItemCompra {
  id: number; insumoId: number; insumoNome: string;
  quantidade: number; precoUnitario: number; subtotal: number;
}
export interface CompraRequest {
  fornecedorId: number; dataCompra: string; notaFiscal: string;
  itens: { insumoId: number; quantidade: number; precoUnitario: number; }[];
}

export interface CatalogoFornecedor {
  id: number; fornecedorId: number; fornecedorNome: string;
  insumoId: number; insumoNome: string;
  preco: number; unidadeVenda: string;
}
export interface CatalogoFornecedorRequest {
  insumoId: number; preco: number; unidadeVenda: string;
}

export interface HistoricoPreco {
  id: number; insumoId: number; insumoNome: string;
  fornecedorId: number; fornecedorNome: string;
  preco: number; dataRegistro: string;
}

export interface TopPratos {
  pratoId: number; pratoNome: string; quantidadeVendida: number;
}

export interface Dashboard {
  faturamentoMensal: number; totalPedidosMes: number;
  pratosAtivos: number; insumosAbaixoMinimo: number;
  totalComprasMes: number; pedidosPorStatus: { [key: string]: number };
  pratosFoodCostAlto: Prato[]; insumosEstoqueBaixo: Insumo[];
  faturamentoDiario: { data: string; valor: number; }[];
  topPratos: TopPratos[];
}

export interface Page<T> {
  content: T[]; totalElements: number; totalPages: number;
  size: number; number: number;
}

export interface CartItem { prato: Prato; quantidade: number; observacao: string; }
