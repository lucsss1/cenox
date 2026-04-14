import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { FichaTecnica, Prato, Insumo } from '../../shared/models/models';

@Component({
  selector: 'app-fichas-tecnicas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./fichas-tecnicas.component.css'],
  template: `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-file-alt"></i> Fichas Tecnicas</h2>
        <p class="page-subtitle">{{fichas.length}} registros encontrados</p>
      </div>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Nova Ficha</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Prato</th><th>Rendimento</th><th>Custo Total</th><th>Custo/Porcao</th><th>Food Cost</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of fichas">
              <td style="color:var(--primary);font-weight:600;font-family:var(--font-mono);">#{{f.id}}</td>
              <td><strong style="color:var(--text-primary);">{{f.pratoNome}}</strong></td>
              <td>{{f.rendimento}} porcoes</td>
              <td>R$ {{f.custoTotal | number:'1.2-2'}}</td>
              <td>R$ {{f.custoPorPorcao | number:'1.2-2'}}</td>
              <td>
                <span *ngIf="f.foodCost" [class]="f.foodCost > 35 ? 'badge badge-danger' : 'badge badge-success'">
                  {{f.foodCost | number:'1.1-1'}}%
                </span>
                <span *ngIf="!f.foodCost" style="color:#555;">&mdash;</span>
              </td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn-icon" (click)="verDetalhes(f)" title="Detalhes"><i class="fas fa-eye"></i></button>
                  <button class="btn-icon btn-icon-warning" (click)="editar(f)" title="Editar"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon btn-icon-danger" (click)="excluir(f.id)" title="Desativar"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="fichas.length === 0"><td colspan="7" style="text-align:center;color:#6B7280;padding:30px;">Nenhuma ficha tecnica</td></tr>
          </tbody>
        </table>
      </div>
      <div style="display:flex;align-items:center;margin-top:16px;" *ngIf="!loading && totalPages > 1">
        <span class="pagination-info">Exibindo {{fichas.length}} registros</span>
        <div class="pagination" style="margin-top:0;">
          <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">&laquo;</button>
          <button *ngFor="let p of pages" (click)="carregar(p)" [class.active]="p === currentPage">{{p + 1}}</button>
          <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">&raquo;</button>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div class="modal-overlay" *ngIf="showDetalhes" (click)="showDetalhes=false">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:700px;">
        <div class="modal-header">
          <h3>Ficha Tecnica - {{fichaDetalhe?.pratoNome}}</h3>
          <button class="modal-close" (click)="showDetalhes=false">&times;</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
          <div><span style="font-size:12px;color:#6B7280;text-transform:uppercase;">Rendimento</span><br><strong style="color:var(--text-primary);">{{fichaDetalhe?.rendimento}} porcoes</strong></div>
          <div><span style="font-size:12px;color:#6B7280;text-transform:uppercase;">Custo Total</span><br><strong style="color:var(--text-primary);">R$ {{fichaDetalhe?.custoTotal | number:'1.2-2'}}</strong></div>
          <div><span style="font-size:12px;color:#6B7280;text-transform:uppercase;">Custo/Porcao</span><br><strong style="color:var(--text-primary);">R$ {{fichaDetalhe?.custoPorPorcao | number:'1.2-2'}}</strong></div>
        </div>
        <table>
          <thead><tr><th>Insumo</th><th>Unid.</th><th>Qtd Bruta</th><th>FC</th><th>Qtd Liquida</th><th>Custo</th></tr></thead>
          <tbody>
            <tr *ngFor="let item of fichaDetalhe?.itens">
              <td><strong style="color:var(--text-primary);">{{item.insumoNome}}</strong></td>
              <td>{{item.unidadeMedida}}</td>
              <td>{{item.quantidadeBruta | number:'1.3-3'}}</td>
              <td>{{item.fatorCorrecao | number:'1.2-2'}}</td>
              <td>{{item.quantidadeLiquida | number:'1.3-3'}}</td>
              <td>R$ {{item.custoItem | number:'1.2-2'}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Criar -->
    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-content ficha-modal" (click)="$event.stopPropagation()">

        <!-- Header dramático escuro -->
        <div class="ficha-modal-header">
          <div class="ficha-header-shimmer"></div>
          <div class="ficha-header-body">
            <div class="ficha-header-icon"><i class="fas fa-file-alt"></i></div>
            <div class="ficha-header-text">
              <h3>{{editando ? 'Editar' : 'Nova'}} Ficha Técnica</h3>
              <p>Defina os ingredientes e rendimento do prato</p>
            </div>
            <button class="modal-close ficha-close" (click)="fecharModal()">&times;</button>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="salvar()">

          <!-- Seção 01: Identificação -->
          <div class="ficha-section">
            <div class="ficha-step-header">
              <span class="ficha-step-num">01</span>
              <span class="ficha-step-title">Identificação</span>
            </div>

            <div class="ficha-ident-grid">
              <div class="form-group ficha-form-group">
                <label>Prato</label>
                <select class="form-control" formControlName="pratoId" [attr.disabled]="editando ? '' : null">
                  <option value="">Selecione o prato...</option>
                  <option *ngFor="let p of pratos" [value]="p.id">{{p.nome}} — R$ {{p.precoVenda | number:'1.2-2'}}</option>
                </select>
              </div>
              <div class="form-group ficha-form-group">
                <label>Rendimento</label>
                <div class="ficha-rendimento-wrap">
                  <input type="number" class="form-control" formControlName="rendimento" min="1">
                  <span class="ficha-rendimento-badge">porç.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Seção 02: Composição -->
          <div class="ficha-section ficha-section-comp">
            <div class="ficha-step-header">
              <span class="ficha-step-num">02</span>
              <span class="ficha-step-title">Composição</span>
              <span class="ficha-count-badge" *ngIf="itensArray.length > 0">
                {{itensArray.length}} ingrediente{{itensArray.length !== 1 ? 's' : ''}}
              </span>
              <button type="button" class="ficha-add-btn" (click)="adicionarItem()">
                <i class="fas fa-plus"></i> Adicionar
              </button>
            </div>

            <div class="ficha-col-header" *ngIf="itensArray.length > 0">
              <span></span>
              <span>Insumo</span>
              <span>Qtd. Bruta</span>
              <span>Fator Corr.</span>
              <span></span>
            </div>

            <div formArrayName="itens" class="ficha-items-list">
              <div *ngFor="let item of itensArray.controls; let i=index"
                   [formGroupName]="i"
                   class="ficha-item-row">
                <div class="ficha-item-index">{{i + 1}}</div>
                <select class="ficha-item-ctrl" formControlName="insumoId">
                  <option value="">Selecione...</option>
                  <option *ngFor="let ins of insumos" [value]="ins.id">{{ins.nome}} ({{ins.unidadeMedida}})</option>
                </select>
                <input type="number" class="ficha-item-ctrl" formControlName="quantidadeBruta" step="0.001" placeholder="0.000">
                <input type="number" class="ficha-item-ctrl" formControlName="fatorCorrecao" step="0.01" min="1" placeholder="1.00">
                <button type="button" class="ficha-remove-btn" (click)="removerItem(i)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="ficha-empty-state" *ngIf="itensArray.length === 0">
              <i class="fas fa-utensils"></i>
              <p>Nenhum ingrediente adicionado</p>
              <span>Clique em "Adicionar" para compor a receita</span>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary ficha-submit-btn" [disabled]="form.invalid || itensArray.length === 0">
              <i class="fas fa-check"></i>
              {{editando ? 'Salvar Alterações' : 'Criar Ficha'}}
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class FichasTecnicasComponent implements OnInit {
  fichas: FichaTecnica[] = [];
  pratos: Prato[] = [];
  insumos: Insumo[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; showDetalhes = false;
  editando = false; editId = 0;
  fichaDetalhe: FichaTecnica | null = null;
  form: FormGroup;

  get itensArray(): FormArray { return this.form.get('itens') as FormArray; }

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      pratoId: ['', Validators.required],
      rendimento: [1, [Validators.required, Validators.min(1)]],
      itens: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.api.getPratos(0).subscribe(p => this.pratos = p.content);
    this.api.getInsumos(0).subscribe(p => this.insumos = p.content);
    this.carregar(0);
  }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getFichasTecnicas(page).subscribe({
      next: (p) => { this.fichas = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void {
    this.editando = false;
    this.editId = 0;
    this.form.reset({ pratoId: '', rendimento: 1 });
    this.itensArray.clear();
    this.adicionarItem();
    this.showModal = true;
  }

  fecharModal(): void { this.showModal = false; }

  editar(f: FichaTecnica): void {
    this.api.getFichaTecnica(f.id).subscribe(ficha => {
      this.editando = true;
      this.editId = ficha.id;
      this.itensArray.clear();
      this.form.patchValue({ pratoId: ficha.pratoId, rendimento: ficha.rendimento });
      ficha.itens?.forEach(item => {
        this.itensArray.push(this.fb.group({
          insumoId: [item.insumoId, Validators.required],
          quantidadeBruta: [item.quantidadeBruta, [Validators.required, Validators.min(0.001)]],
          fatorCorrecao: [item.fatorCorrecao, [Validators.required, Validators.min(1)]]
        }));
      });
      this.showModal = true;
    });
  }

  adicionarItem(): void {
    this.itensArray.push(this.fb.group({
      insumoId: ['', Validators.required],
      quantidadeBruta: [0, [Validators.required, Validators.min(0.001)]],
      fatorCorrecao: [1, [Validators.required, Validators.min(1)]]
    }));
  }

  removerItem(i: number): void { this.itensArray.removeAt(i); }

  salvar(): void {
    if (this.form.invalid) return;
    const val = {
      ...this.form.value,
      pratoId: +this.form.value.pratoId,
      itens: this.form.value.itens.map((i: any) => ({ ...i, insumoId: +i.insumoId }))
    };
    const obs = this.editando
      ? this.api.updateFichaTecnica(this.editId, val)
      : this.api.createFichaTecnica(val);
    obs.subscribe({
      next: () => {
        this.toast.success(this.editando ? 'Ficha atualizada!' : 'Ficha tecnica criada!');
        this.fecharModal();
        this.carregar(this.currentPage);
      },
      error: () => {}
    });
  }

  verDetalhes(f: FichaTecnica): void {
    this.api.getFichaTecnica(f.id).subscribe(ficha => {
      this.fichaDetalhe = ficha;
      this.showDetalhes = true;
    });
  }

  excluir(id: number): void {
    if (!confirm('Desativar esta ficha tecnica? O prato associado sera desativado.')) return;
    this.api.deleteFichaTecnica(id).subscribe({
      next: () => { this.toast.success('Ficha desativada!'); this.carregar(this.currentPage); }
    });
  }
}
