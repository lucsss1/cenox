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
  template: `
    <div class="page-header">
      <h2><i class="fas fa-file-alt"></i> Fichas Tecnicas</h2>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Nova Ficha</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Prato</th><th>Rendimento</th><th>Custo Total</th><th>Custo/Porcao</th><th>Food Cost</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of fichas">
              <td>{{f.id}}</td>
              <td><strong>{{f.pratoNome}}</strong></td>
              <td>{{f.rendimento}} porcoes</td>
              <td>R$ {{f.custoTotal | number:'1.2-2'}}</td>
              <td>R$ {{f.custoPorPorcao | number:'1.2-2'}}</td>
              <td>
                <span *ngIf="f.foodCost" [class]="f.foodCost > 35 ? 'badge badge-danger' : 'badge badge-success'">
                  {{f.foodCost | number:'1.1-1'}}%
                </span>
                <span *ngIf="!f.foodCost">-</span>
              </td>
              <td>
                <button class="btn btn-info btn-sm" (click)="verDetalhes(f)"><i class="fas fa-eye"></i></button>
                <button class="btn btn-danger btn-sm" (click)="excluir(f.id)"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr *ngIf="fichas.length === 0"><td colspan="7" style="text-align:center;color:var(--gray-500);">Nenhuma ficha tecnica</td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">Anterior</button>
        <button *ngFor="let p of pages" (click)="carregar(p)" [class.active]="p === currentPage">{{p + 1}}</button>
        <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">Proximo</button>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div class="modal-overlay" *ngIf="showDetalhes" (click)="showDetalhes=false">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:700px;">
        <div class="modal-header">
          <h3>Ficha Tecnica - {{fichaDetalhe?.pratoNome}}</h3>
          <button class="modal-close" (click)="showDetalhes=false">&times;</button>
        </div>
        <p><strong>Rendimento:</strong> {{fichaDetalhe?.rendimento}} porcoes</p>
        <p><strong>Custo Total:</strong> R$ {{fichaDetalhe?.custoTotal | number:'1.2-2'}}</p>
        <p><strong>Custo/Porcao:</strong> R$ {{fichaDetalhe?.custoPorPorcao | number:'1.2-2'}}</p>
        <table style="margin-top:12px;">
          <thead><tr><th>Insumo</th><th>Unid.</th><th>Qtd Bruta</th><th>FC</th><th>Qtd Liquida</th><th>Custo</th></tr></thead>
          <tbody>
            <tr *ngFor="let item of fichaDetalhe?.itens">
              <td>{{item.insumoNome}}</td><td>{{item.unidadeMedida}}</td>
              <td>{{item.quantidadeBruta | number:'1.3-3'}}</td><td>{{item.fatorCorrecao | number:'1.2-2'}}</td>
              <td>{{item.quantidadeLiquida | number:'1.3-3'}}</td><td>R$ {{item.custoItem | number:'1.2-2'}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Criar -->
    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:700px;">
        <div class="modal-header">
          <h3>Nova Ficha Tecnica</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-group">
            <label>Prato</label>
            <select class="form-control" formControlName="pratoId">
              <option value="">Selecione...</option>
              <option *ngFor="let p of pratos" [value]="p.id">{{p.nome}} (R$ {{p.precoVenda | number:'1.2-2'}})</option>
            </select>
          </div>
          <div class="form-group">
            <label>Rendimento (porcoes)</label>
            <input type="number" class="form-control" formControlName="rendimento" min="1">
          </div>

          <h4 style="margin:16px 0 8px;">Ingredientes</h4>
          <div formArrayName="itens">
            <div *ngFor="let item of itensArray.controls; let i=index" [formGroupName]="i" style="display:flex;gap:8px;margin-bottom:8px;align-items:end;">
              <div class="form-group" style="flex:2;margin:0;">
                <label *ngIf="i===0">Insumo</label>
                <select class="form-control" formControlName="insumoId">
                  <option value="">Sel...</option>
                  <option *ngFor="let ins of insumos" [value]="ins.id">{{ins.nome}} ({{ins.unidadeMedida}})</option>
                </select>
              </div>
              <div class="form-group" style="flex:1;margin:0;">
                <label *ngIf="i===0">Qtd Bruta</label>
                <input type="number" class="form-control" formControlName="quantidadeBruta" step="0.001">
              </div>
              <div class="form-group" style="flex:1;margin:0;">
                <label *ngIf="i===0">Fator Corr.</label>
                <input type="number" class="form-control" formControlName="fatorCorrecao" step="0.01" min="1">
              </div>
              <button type="button" class="btn btn-danger btn-sm" (click)="removerItem(i)" style="margin-bottom:2px;">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" (click)="adicionarItem()"><i class="fas fa-plus"></i> Ingrediente</button>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || itensArray.length === 0">Salvar</button>
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
    this.form.reset({ pratoId: '', rendimento: 1 });
    this.itensArray.clear();
    this.adicionarItem();
    this.showModal = true;
  }

  fecharModal(): void { this.showModal = false; }

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
    this.api.createFichaTecnica(val).subscribe({
      next: () => { this.toast.success('Ficha tecnica criada!'); this.fecharModal(); this.carregar(this.currentPage); },
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
