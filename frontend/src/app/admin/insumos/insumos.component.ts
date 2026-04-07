import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Insumo, Fornecedor, CatalogoFornecedor, HistoricoPreco } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type ActiveTab = 'todos' | 'baixo' | 'validade';
type ValidadeFilter = 'proximos' | 'vencidos' | 'todos';

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-cubes"></i> Insumos</h2>
        <p class="page-subtitle">Gestão de ingredientes e controle de estoque</p>
      </div>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Insumo</button>
    </div>

    <!-- Tab Bar -->
    <div class="insumos-tabs">
      <button class="insumo-tab" [class.tab-active]="activeTab === 'todos'" (click)="switchTab('todos')">
        <i class="fas fa-list"></i> Todos
      </button>
      <button class="insumo-tab" [class.tab-active]="activeTab === 'baixo'" (click)="switchTab('baixo')">
        <i class="fas fa-exclamation-triangle"></i> Estoque Baixo
        <span class="tab-badge" *ngIf="insumosBaixo.length > 0 || activeTab === 'baixo'">{{insumosBaixo.length}}</span>
      </button>
      <button class="insumo-tab" [class.tab-active]="activeTab === 'validade'" (click)="switchTab('validade')">
        <i class="fas fa-calendar-check"></i> Validades
        <span class="tab-badge tab-badge-red" *ngIf="validadeVencidos.length > 0">{{validadeVencidos.length}}</span>
      </button>
    </div>

    <!-- ═══════════════════ TAB: TODOS ═══════════════════ -->
    <div *ngIf="activeTab === 'todos'">
      <div class="card">
        <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
        <div class="table-container" *ngIf="!loading">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Nome</th><th>Categoria</th><th>Unidade</th>
                <th>Estoque</th><th>Mín.</th><th>Custo Médio</th>
                <th>Validade</th><th>Fornecedor</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of insumos">
                <td style="color:var(--primary);font-weight:600;font-family:var(--font-mono);">#{{i.id}}</td>
                <td><strong style="color:var(--text-primary);">{{i.nome}}</strong></td>
                <td>{{i.categoria || '&mdash;'}}</td>
                <td>{{i.unidadeMedida}}</td>
                <td>{{i.quantidadeEstoque | number:'1.0-3'}}</td>
                <td>{{i.estoqueMinimo | number:'1.0-3'}}</td>
                <td>{{i.custoMedio ? 'R$ ' + (i.custoMedio | number:'1.2-2') : '&mdash;'}}</td>
                <td>
                  <span *ngIf="i.dataValidade" [style.color]="isVencido(i.dataValidade) ? '#EF4444' : isProximoVencer(i.dataValidade) ? '#F59E0B' : '#6B7280'">
                    {{i.dataValidade}}
                  </span>
                  <span *ngIf="!i.dataValidade">&mdash;</span>
                </td>
                <td>{{i.fornecedorNome || '&mdash;'}}</td>
                <td>
                  <span [class]="i.abaixoEstoqueMinimo ? 'badge badge-danger' : 'badge badge-success'">
                    <span class="badge-dot"></span>
                    {{i.abaixoEstoqueMinimo ? 'BAIXO' : 'OK'}}
                  </span>
                </td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="btn-icon btn-icon-success" (click)="abrirEntrada(i)" title="Registrar Entrada"><i class="fas fa-arrow-up"></i></button>
                    <button class="btn-icon btn-icon-warning" (click)="abrirSaida(i)" title="Retirada Manual"><i class="fas fa-arrow-down"></i></button>
                    <button class="btn-icon" (click)="verCotacao(i)" title="Cotação"><i class="fas fa-search-dollar"></i></button>
                    <button class="btn-icon" (click)="verHistorico(i)" title="Histórico de Preços" style="border-color:rgba(124,58,237,0.3);color:#A78BFA;"><i class="fas fa-chart-line"></i></button>
                    <button class="btn-icon btn-icon-warning" (click)="editar(i)" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-icon-danger" (click)="excluir(i.id)" title="Excluir"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="insumos.length === 0">
                <td colspan="11">
                  <div class="empty-state" style="padding:40px 0;">
                    <div class="empty-state-icon"><i class="fas fa-cubes"></i></div>
                    <h3>Nenhum insumo cadastrado</h3>
                    <p>Comece registrando os ingredientes do seu cardápio.</p>
                    <button class="btn btn-primary" style="margin-top:12px;" (click)="abrirModal()">
                      <i class="fas fa-plus"></i> Cadastrar Primeiro Insumo
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="display:flex;align-items:center;margin-top:16px;" *ngIf="!loading && totalPages > 1">
          <span class="pagination-info">Exibindo {{insumos.length}} registros</span>
          <div class="pagination" style="margin-top:0;">
            <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">&laquo;</button>
            <button *ngFor="let p of pages" (click)="carregar(p)" [class.active]="p === currentPage">{{p + 1}}</button>
            <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">&raquo;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════ TAB: ESTOQUE BAIXO ═══════════════════ -->
    <div *ngIf="activeTab === 'baixo'">
      <div class="card">
        <div class="loading" *ngIf="loadingBaixo"><div class="spinner"></div></div>
        <div class="table-container" *ngIf="!loadingBaixo">
          <table>
            <thead>
              <tr><th>Nome</th><th>Estoque Atual</th><th>Estoque Mín.</th><th>Fornecedor</th><th>Ações</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of insumosBaixo">
                <td><strong style="color:var(--text-primary);">{{i.nome}}</strong></td>
                <td><span class="badge badge-danger"><span class="badge-dot"></span>{{i.quantidadeEstoque | number:'1.0-3'}} {{i.unidadeMedida}}</span></td>
                <td>{{i.estoqueMinimo | number:'1.0-3'}} {{i.unidadeMedida}}</td>
                <td>{{i.fornecedorNome || '&mdash;'}}</td>
                <td>
                  <button class="btn-icon btn-icon-success" (click)="abrirEntrada(i)" title="Registrar Entrada">
                    <i class="fas fa-arrow-up"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="insumosBaixo.length === 0">
                <td colspan="5" style="text-align:center;padding:40px;color:#10B981;">
                  <i class="fas fa-check-circle" style="font-size:28px;display:block;margin-bottom:8px;"></i>
                  Nenhum insumo com estoque abaixo do mínimo!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════ TAB: VALIDADES ═══════════════════ -->
    <div *ngIf="activeTab === 'validade'">

      <!-- Summary strip -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;">
        <div class="card" style="border-left:4px solid #EF4444;padding:16px;cursor:pointer;"
             [class.validade-filter-active]="validadeFilter === 'vencidos'"
             (click)="validadeFilter = 'vencidos'">
          <div style="font-size:13px;color:#6B7280;">Vencidos</div>
          <div style="font-size:28px;font-weight:700;color:#EF4444;">{{validadeVencidos.length}}</div>
        </div>
        <div class="card" style="border-left:4px solid #F59E0B;padding:16px;cursor:pointer;"
             [class.validade-filter-active]="validadeFilter === 'proximos'"
             (click)="validadeFilter = 'proximos'">
          <div style="font-size:13px;color:#6B7280;">Vencem em 3 dias</div>
          <div style="font-size:28px;font-weight:700;color:#F59E0B;">{{validadeProximos.length}}</div>
        </div>
        <div class="card" style="border-left:4px solid #10B981;padding:16px;cursor:pointer;"
             [class.validade-filter-active]="validadeFilter === 'todos'"
             (click)="validadeFilter = 'todos'">
          <div style="font-size:13px;color:#6B7280;">Com validade registrada</div>
          <div style="font-size:28px;font-weight:700;color:#10B981;">{{validadeTodos.length}}</div>
        </div>
      </div>

      <div class="card">
        <div class="loading" *ngIf="loadingValidade"><div class="spinner"></div></div>
        <div class="table-container" *ngIf="!loadingValidade">
          <table>
            <thead>
              <tr>
                <th>Produto</th><th>Categoria</th><th>Validade</th>
                <th>Dias Restantes</th><th>Estoque</th><th>Fornecedor</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of validadeExibidos">
                <td><strong style="color:var(--text-primary);">{{i.nome}}</strong></td>
                <td>{{i.categoria || '&mdash;'}}</td>
                <td [style.color]="corValidade(i)"><strong>{{i.dataValidade}}</strong></td>
                <td><span [style.color]="corValidade(i)" style="font-weight:600;">{{diasRestantes(i.dataValidade)}}</span></td>
                <td>{{i.quantidadeEstoque | number:'1.0-3'}} {{i.unidadeMedida}}</td>
                <td>{{i.fornecedorNome || '&mdash;'}}</td>
                <td>
                  <span *ngIf="isVencido(i.dataValidade)" class="badge badge-danger"><span class="badge-dot"></span>VENCIDO</span>
                  <span *ngIf="!isVencido(i.dataValidade) && isProximoVencer(i.dataValidade)" class="badge badge-warning"><span class="badge-dot"></span>A VENCER</span>
                  <span *ngIf="!isVencido(i.dataValidade) && !isProximoVencer(i.dataValidade)" class="badge badge-success"><span class="badge-dot"></span>OK</span>
                </td>
              </tr>
              <tr *ngIf="validadeExibidos.length === 0">
                <td colspan="7" style="text-align:center;color:#6B7280;padding:30px;">
                  <i class="fas fa-check-circle" style="font-size:24px;color:#10B981;display:block;margin-bottom:8px;"></i>
                  {{validadeFilter === 'vencidos' ? 'Nenhum produto vencido' : validadeFilter === 'proximos' ? 'Nenhum produto próximo do vencimento' : 'Nenhum produto com validade registrada'}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- Modal Criar/Editar Insumo                                          -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{editando ? 'Editar' : 'Novo'}} Insumo</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group"><label>Nome *</label><input type="text" class="form-control" formControlName="nome"></div>
            <div class="form-group"><label>Categoria</label><input type="text" class="form-control" formControlName="categoria" placeholder="Ex: Hortifruti, Carnes..."></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label>Unidade de Medida *</label>
              <select class="form-control" formControlName="unidadeMedida">
                <option value="">Selecione...</option>
                <option value="KG">KG</option><option value="G">G</option>
                <option value="L">L</option><option value="ML">ML</option><option value="UN">UN</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fornecedor</label>
              <select class="form-control" formControlName="fornecedorId">
                <option [ngValue]="null">Nenhum</option>
                <option *ngFor="let f of fornecedores" [ngValue]="f.id">{{f.nomeEmpresa}}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Estoque Mínimo *</label>
            <input type="number" class="form-control" formControlName="estoqueMinimo" step="0.001">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Salvar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Registrar Entrada -->
    <div class="modal-overlay" *ngIf="showEntradaModal" (click)="showEntradaModal=false">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:420px;">
        <div class="modal-header">
          <h3><i class="fas fa-arrow-up" style="color:#10B981;margin-right:8px;"></i> Registrar Entrada</h3>
          <button class="modal-close" (click)="showEntradaModal=false">&times;</button>
        </div>
        <div style="margin-bottom:16px;padding:10px;background:rgba(22,163,74,0.06);border:1px solid rgba(22,163,74,0.15);border-radius:8px;font-size:13px;color:#4ADE80;">
          <i class="fas fa-boxes" style="margin-right:6px;"></i> {{entradaInsumoNome}}
        </div>
        <div class="form-group">
          <label>Quantidade *</label>
          <input type="number" class="form-control" [(ngModel)]="entradaQtd" step="0.001" min="0.001" placeholder="0.000">
        </div>
        <div class="form-group">
          <label>Observação</label>
          <input type="text" class="form-control" [(ngModel)]="entradaObs" placeholder="Ex: NF 12345, Fornecedor X..." maxlength="255">
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showEntradaModal=false">Cancelar</button>
          <button class="btn btn-success" [disabled]="salvandoEntrada || entradaQtd <= 0" (click)="confirmarEntrada()">
            <i class="fas fa-check"></i> {{salvandoEntrada ? 'Registrando...' : 'Confirmar Entrada'}}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Retirada Manual -->
    <div class="modal-overlay" *ngIf="showSaidaModal" (click)="showSaidaModal=false">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:400px;">
        <div class="modal-header">
          <h3>Retirada Manual — {{saidaInsumoNome}}</h3>
          <button class="modal-close" (click)="showSaidaModal=false">&times;</button>
        </div>
        <div class="form-group">
          <label>Quantidade</label>
          <input type="number" class="form-control" [(ngModel)]="saidaQtd" step="0.001" min="0.001">
        </div>
        <div class="form-group">
          <label>Motivo *</label>
          <select class="form-control" [(ngModel)]="saidaMotivo">
            <option value="">Selecione o motivo...</option>
            <option value="DESPERDICIO">Desperdício</option>
            <option value="VENCIMENTO">Vencimento</option>
            <option value="QUEBRA">Quebra</option>
            <option value="USO_INTERNO">Uso Interno</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showSaidaModal=false">Cancelar</button>
          <button class="btn btn-danger" [disabled]="!saidaMotivo || saidaQtd <= 0" (click)="confirmarSaida()">Registrar Retirada</button>
        </div>
      </div>
    </div>

    <!-- Modal Cotação Comparativa -->
    <div class="modal-overlay" *ngIf="showCotacaoModal" (click)="showCotacaoModal=false">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:600px;">
        <div class="modal-header">
          <h3><i class="fas fa-search-dollar" style="color:var(--primary);margin-right:8px;"></i> Cotação — {{cotacaoInsumoNome}}</h3>
          <button class="modal-close" (click)="showCotacaoModal=false">&times;</button>
        </div>
        <table *ngIf="cotacaoItens.length > 0">
          <thead><tr><th>#</th><th>Fornecedor</th><th>Preço</th><th>Unidade</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of cotacaoItens; let idx = index">
              <td><span class="rank-number" [class.rank-1]="idx === 0">{{idx + 1}}</span></td>
              <td><strong style="color:var(--text-primary);">{{c.fornecedorNome}}</strong></td>
              <td><strong style="color:var(--text-primary);">R$ {{c.preco | number:'1.4-4'}}</strong></td>
              <td>{{c.unidadeVenda}}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="cotacaoItens.length === 0" style="text-align:center;color:#6B7280;padding:20px;">Nenhum fornecedor cadastrado para este insumo</p>
      </div>
    </div>

    <!-- Modal Histórico de Preços -->
    <div class="modal-overlay" *ngIf="showHistoricoModal" (click)="showHistoricoModal=false">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:700px;">
        <div class="modal-header">
          <h3><i class="fas fa-chart-line" style="color:#A78BFA;margin-right:8px;"></i> Histórico de Preços — {{historicoInsumoNome}}</h3>
          <button class="modal-close" (click)="showHistoricoModal=false">&times;</button>
        </div>
        <canvas #historicoChart></canvas>
        <table *ngIf="historicoItens.length > 0" style="margin-top:16px;">
          <thead><tr><th>Data</th><th>Fornecedor</th><th>Preço</th></tr></thead>
          <tbody>
            <tr *ngFor="let h of historicoItens">
              <td>{{h.dataRegistro}}</td>
              <td><strong style="color:var(--text-primary);">{{h.fornecedorNome}}</strong></td>
              <td><strong style="color:var(--text-primary);">R$ {{h.preco | number:'1.4-4'}}</strong></td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="historicoItens.length === 0" style="text-align:center;color:#6B7280;padding:20px;">Nenhum histórico de preços disponível</p>
      </div>
    </div>
  `,
  styleUrls: ['./insumos.component.css']
})
export class InsumosComponent implements OnInit {
  @ViewChild('historicoChart') historicoRef!: ElementRef<HTMLCanvasElement>;

  // Tab state
  activeTab: ActiveTab = 'todos';

  // Tab: todos
  insumos: Insumo[] = [];
  fornecedores: Fornecedor[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];

  // Tab: baixo
  insumosBaixo: Insumo[] = [];
  loadingBaixo = false;

  // Tab: validade
  validadeFilter: ValidadeFilter = 'proximos';
  validadeVencidos: Insumo[] = [];
  validadeProximos: Insumo[] = [];
  validadeTodos: Insumo[] = [];
  loadingValidade = false;

  // Modal: criar/editar
  showModal = false; editando = false; editId = 0;
  form: FormGroup;

  // Modal: entrada inline
  showEntradaModal = false;
  entradaInsumoId = 0;
  entradaInsumoNome = '';
  entradaQtd = 0;
  entradaObs = '';
  salvandoEntrada = false;

  // Modal: saída
  showSaidaModal = false;
  saidaInsumoId = 0;
  saidaInsumoNome = '';
  saidaQtd = 0;
  saidaMotivo = '';

  // Modal: cotação
  showCotacaoModal = false;
  cotacaoInsumoNome = '';
  cotacaoItens: CatalogoFornecedor[] = [];

  // Modal: histórico
  showHistoricoModal = false;
  historicoInsumoNome = '';
  historicoItens: HistoricoPreco[] = [];
  private histChart: Chart | null = null;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required], unidadeMedida: ['', Validators.required],
      estoqueMinimo: [0, [Validators.required, Validators.min(0)]],
      categoria: [''], fornecedorId: [null]
    });
  }

  ngOnInit(): void {
    this.carregar(0);
    this.api.getFornecedoresTodos().subscribe({ next: (f) => this.fornecedores = f });
  }

  // ── Tab switching ──────────────────────────────────────────────────────────
  switchTab(tab: ActiveTab): void {
    this.activeTab = tab;
    if (tab === 'baixo' && this.insumosBaixo.length === 0) this.carregarBaixo();
    if (tab === 'validade' && this.validadeTodos.length === 0) this.carregarValidade();
  }

  // ── Tab: todos ─────────────────────────────────────────────────────────────
  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getInsumos(page).subscribe({
      next: (p) => {
        this.insumos = p.content; this.totalPages = p.totalPages;
        this.pages = Array.from({ length: p.totalPages }, (_, i) => i);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Tab: baixo ─────────────────────────────────────────────────────────────
  carregarBaixo(): void {
    this.loadingBaixo = true;
    this.api.getInsumosEstoqueBaixo().subscribe({
      next: (d) => { this.insumosBaixo = d; this.loadingBaixo = false; },
      error: () => { this.loadingBaixo = false; }
    });
  }

  // ── Tab: validade ──────────────────────────────────────────────────────────
  carregarValidade(): void {
    this.loadingValidade = true;
    let loaded = 0;
    const check = () => { loaded++; if (loaded === 3) this.loadingValidade = false; };
    this.api.getVencidos().subscribe({ next: d => { this.validadeVencidos = d; check(); }, error: () => check() });
    this.api.getProximosVencimento().subscribe({ next: d => { this.validadeProximos = d; check(); }, error: () => check() });
    this.api.getOrdenadoValidade().subscribe({ next: d => { this.validadeTodos = d; check(); }, error: () => check() });
  }

  get validadeExibidos(): Insumo[] {
    switch (this.validadeFilter) {
      case 'vencidos': return this.validadeVencidos;
      case 'proximos': return this.validadeProximos;
      default: return this.validadeTodos;
    }
  }

  // ── Modal: criar/editar ────────────────────────────────────────────────────
  abrirModal(): void { this.editando = false; this.form.reset(); this.showModal = true; }

  editar(i: Insumo): void {
    this.editando = true; this.editId = i.id;
    this.form.patchValue({
      nome: i.nome, unidadeMedida: i.unidadeMedida, estoqueMinimo: i.estoqueMinimo,
      categoria: i.categoria, fornecedorId: i.fornecedorId || null
    });
    this.showModal = true;
  }

  fecharModal(): void { this.showModal = false; }

  salvar(): void {
    if (this.form.invalid) return;
    const obs = this.editando
      ? this.api.updateInsumo(this.editId, this.form.value)
      : this.api.createInsumo(this.form.value);
    obs.subscribe({
      next: () => { this.toast.success('Insumo salvo!'); this.fecharModal(); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  excluir(id: number): void {
    if (!confirm('Desativar este insumo?')) return;
    this.api.deleteInsumo(id).subscribe({
      next: () => { this.toast.success('Insumo desativado!'); this.carregar(this.currentPage); }
    });
  }

  // ── Modal: entrada inline ──────────────────────────────────────────────────
  abrirEntrada(i: Insumo): void {
    this.entradaInsumoId = i.id;
    this.entradaInsumoNome = i.nome;
    this.entradaQtd = 0;
    this.entradaObs = '';
    this.showEntradaModal = true;
  }

  confirmarEntrada(): void {
    if (this.entradaQtd <= 0) return;
    this.salvandoEntrada = true;
    this.api.entradaEstoque(this.entradaInsumoId, { quantidade: this.entradaQtd, observacao: this.entradaObs }).subscribe({
      next: () => {
        this.toast.success('Entrada registrada!');
        this.showEntradaModal = false;
        this.salvandoEntrada = false;
        this.carregar(this.currentPage);
        if (this.activeTab === 'baixo') this.carregarBaixo();
      },
      error: () => { this.salvandoEntrada = false; }
    });
  }

  // ── Modal: saída ───────────────────────────────────────────────────────────
  abrirSaida(i: Insumo): void {
    this.saidaInsumoId = i.id; this.saidaInsumoNome = i.nome;
    this.saidaQtd = 0; this.saidaMotivo = '';
    this.showSaidaModal = true;
  }

  confirmarSaida(): void {
    if (!this.saidaMotivo || this.saidaQtd <= 0) return;
    this.api.saidaManual(this.saidaInsumoId, { quantidade: this.saidaQtd, motivo: this.saidaMotivo }).subscribe({
      next: () => { this.toast.success('Retirada registrada!'); this.showSaidaModal = false; this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  // ── Modal: cotação ─────────────────────────────────────────────────────────
  verCotacao(i: Insumo): void {
    this.cotacaoInsumoNome = i.nome;
    this.api.getCotacaoInsumo(i.id).subscribe({
      next: (data) => { this.cotacaoItens = data; this.showCotacaoModal = true; }
    });
  }

  // ── Modal: histórico ───────────────────────────────────────────────────────
  verHistorico(i: Insumo): void {
    this.historicoInsumoNome = i.nome;
    this.api.getHistoricoPrecos(i.id).subscribe({
      next: (data) => {
        this.historicoItens = data;
        this.showHistoricoModal = true;
        setTimeout(() => this.renderHistoricoChart(), 200);
      }
    });
  }

  // ── Validade helpers ───────────────────────────────────────────────────────
  isVencido(data: string): boolean {
    return new Date(data) < new Date(new Date().toISOString().split('T')[0]);
  }

  isProximoVencer(data: string): boolean {
    const validade = new Date(data);
    const hoje = new Date(new Date().toISOString().split('T')[0]);
    const diffDias = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias >= 0 && diffDias <= 7;
  }

  diasRestantes(dataValidade: string): string {
    if (!dataValidade) return '—';
    const diff = Math.ceil((new Date(dataValidade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} dia(s) vencido`;
    if (diff === 0) return 'Vence hoje';
    return `${diff} dia(s)`;
  }

  corValidade(i: Insumo): string {
    if (this.isVencido(i.dataValidade)) return '#EF4444';
    if (this.isProximoVencer(i.dataValidade)) return '#F59E0B';
    return '#6B7280';
  }

  // ── Chart ──────────────────────────────────────────────────────────────────
  private renderHistoricoChart(): void {
    if (!this.historicoRef || this.historicoItens.length === 0) return;
    const ctx = this.historicoRef.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.histChart) this.histChart.destroy();
    this.histChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.historicoItens.map(h => h.dataRegistro),
        datasets: [{
          label: 'Preço (R$)',
          data: this.historicoItens.map(h => h.preco),
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124,58,237,0.08)',
          fill: true, tension: 0.3, pointRadius: 4, borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, ticks: { color: '#555' }, grid: { color: '#1A1A1A' }, border: { display: false } },
          x: { ticks: { color: '#555' }, grid: { display: false }, border: { display: false } }
        }
      }
    });
  }
}
