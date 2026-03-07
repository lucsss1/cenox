import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hub-header">
      <div>
        <h2><i class="fas fa-th-large"></i> Dashboards</h2>
        <p class="hub-subtitle">Selecione um painel para visualizar</p>
      </div>
      <div class="system-status">
        <span class="status-dot"></span> Sistema online
      </div>
    </div>

    <div class="hub-grid">
      <a *ngFor="let card of cards"
         [routerLink]="card.route"
         class="hub-card"
         [style.--card-color]="card.color">
        <div class="hub-card-icon" [style.background]="card.color + '14'" [style.color]="card.color">
          <i [class]="'fas ' + card.icon"></i>
        </div>
        <div class="hub-card-body">
          <h3>{{card.title}}</h3>
          <p>{{card.description}}</p>
        </div>
        <div class="hub-card-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </a>
    </div>
  `,
  styles: [`
    .hub-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 32px;
    }
    .hub-header h2 {
      font-size: 22px; font-weight: 700; color: #F9FAFB;
      display: flex; align-items: center; gap: 10px;
    }
    .hub-header h2 i { color: var(--primary); font-size: 18px; }
    .hub-subtitle { font-size: 13px; color: #6B7280; margin-top: 2px; }
    .system-status {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 20px;
      border: 1px solid rgba(22,163,74,0.2); background: rgba(22,163,74,0.05);
      font-size: 12px; color: #4ADE80; font-weight: 500;
    }
    .status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #4ADE80; animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .hub-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .hub-card {
      display: flex; align-items: center; gap: 16px;
      padding: 24px;
      background: #111111;
      border: 1px solid #1A1A1A;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .hub-card:hover {
      border-color: var(--card-color, #333);
      background: #161616;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }

    .hub-card-icon {
      width: 52px; height: 52px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .hub-card-body {
      flex: 1; min-width: 0;
    }
    .hub-card-body h3 {
      font-size: 16px; font-weight: 600; color: #F3F4F6;
      margin: 0 0 4px 0;
    }
    .hub-card-body p {
      font-size: 13px; color: #6B7280; margin: 0;
      line-height: 1.4;
    }

    .hub-card-arrow {
      color: #333; font-size: 14px;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .hub-card:hover .hub-card-arrow {
      color: var(--card-color, #666);
      transform: translateX(3px);
    }

    @media (max-width: 768px) {
      .hub-grid { grid-template-columns: 1fr; }
      .hub-header { flex-direction: column; gap: 12px; }
    }
  `]
})
export class DashboardHubComponent {
  cards: DashboardCard[] = [
    {
      title: 'Faturamento Diario',
      description: 'Receita dos ultimos 30 dias e indicadores financeiros',
      icon: 'fa-dollar-sign',
      color: '#10B981',
      route: '/admin/dashboard/faturamento'
    },
    {
      title: 'Pedidos',
      description: 'Distribuicao de pedidos por status e volume mensal',
      icon: 'fa-clipboard-list',
      color: '#3B82F6',
      route: '/admin/dashboard/pedidos'
    },
    {
      title: 'Painel de Estoque',
      description: 'Produtos vencidos, estoque baixo e ultimas entradas',
      icon: 'fa-warehouse',
      color: '#F59E0B',
      route: '/admin/dashboard/estoque'
    },
    {
      title: 'Top 5 Pratos Vendidos',
      description: 'Ranking dos pratos mais vendidos por periodo',
      icon: 'fa-trophy',
      color: '#FCD34D',
      route: '/admin/dashboard/top-pratos'
    },
    {
      title: 'Alertas Operacionais',
      description: 'Produtos vencidos, estoque critico e food cost alto',
      icon: 'fa-exclamation-triangle',
      color: '#EF4444',
      route: '/admin/dashboard/alertas'
    }
  ];
}
