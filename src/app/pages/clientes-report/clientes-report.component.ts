import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioSummary } from '../../models/usuario.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ClienteService } from '../../services/cliente.service';
import { ClienteSummary, Modalidade } from '../../models/cliente.model';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    /* nesse componente há uma área que mostra todos os itens de relatório selecionados,
       e agora inclui também a faixa etária, com o mesmo estilo das badges existentes. */
    .selected-report-list {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 1rem 1.5rem;
      margin-bottom: 1rem;
      border: 1px solid #e3e6ea;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .selected-report-list h6 {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    .selected-report-list ul {
      list-style: none;
      padding-left: 0;
      margin-bottom: 0;
    }
    .selected-report-list li {
      margin-bottom: 0.25rem;
      font-size: 1.05rem;
      color: #212529;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: .25rem;
    }
    .selected-report-badge {
      display: inline-block;
      background: #0d6efd;
      color: #fff;
      border-radius: 12px;
      padding: 0.2em 0.8em;
      font-size: 0.95em;
      margin-right: 0.5em;
      margin-bottom: 0.2em;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    .selected-report-badge.secondary { background: #8c925aff; }
    .selected-report-badge.success   { background: #606726ff; }
    .selected-report-badge.warning   { background: #f6e3aaff; color: #212529; }
    .selected-report-badge.info      { background: #dce708ff; color: #212529; }
    .selected-report-badge.selected-mod   { background: #d4cb65ff; color: #000000ff;}
    .selected-report.selected-mod-label { color: #000000ff; border-radius: 12px; margin-right: 5px; font-weight: 600; }
  `],
  template: `
  <div class="container-xxl py-3">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h4 class="m-0">Relatórios</h4>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">

        <div class="mb-5 mt-3">
          <label for="reportType" class="form-label me-2">Tipo de relatório:</label>
          <select id="reportType" class="form-select d-inline-block w-auto" [(ngModel)]="selectedReportType">
            <option value="cobrancas">Cobranças</option>
            <option value="clientes">Clientes</option>
          </select>
        </div>

        <!-- Cobranças -->
        <div class="mb-5" *ngIf="selectedReportType === 'cobrancas'">
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="cobrancasPagas" [(ngModel)]="cobrancasPagas" />
            <label class="form-check-label" for="cobrancasPagas">Cobranças pagas</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="cobrancasFeitas" [(ngModel)]="cobrancasFeitas" />
            <label class="form-check-label" for="cobrancasFeitas">Cobranças feitas</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="cobrancasPagasMes" [(ngModel)]="cobrancasPagasMes" />
            <label class="form-check-label" for="cobrancasPagasMes">Cobranças pagas no mês</label>
          </div>
        </div>

        <!-- Clientes -->
        <div class="mb-5" *ngIf="selectedReportType === 'clientes'">
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="clientesAtivos" [(ngModel)]="clientesAtivos" />
            <label class="form-check-label" for="clientesAtivos">Clientes ativos</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="clientesInativos" [(ngModel)]="clientesInativos" />
            <label class="form-check-label" for="clientesInativos">Clientes inativos</label>
          </div>

          <!-- Faixa etária -->
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="clientesPorFaixaEtaria" [(ngModel)]="clientesPorFaixaEtaria" />
            <label class="form-check-label" for="clientesPorFaixaEtaria">Clientes por faixa etária</label>
          </div>
          <div *ngIf="clientesPorFaixaEtaria" class="mt-2 d-flex align-items-center gap-2 flex-wrap">
            <label class="form-label mb-0" for="faixaEtariaInicial">De:</label>
            <input id="faixaEtariaInicial" type="number" class="form-control w-auto"
                   [(ngModel)]="faixaEtariaInicial" min="0" />
            <label class="form-label mb-0" for="faixaEtariaFinal">até</label>
            <input id="faixaEtariaFinal" type="number" class="form-control w-auto"
                   [(ngModel)]="faixaEtariaFinal" [min]="faixaEtariaInicial || 0" />
            <span class="ms-1">anos</span>
          </div>

          <!-- Por modalidade -->
          <div class="form-check form-check-inline mt-2">
            <input class="form-check-input" type="radio" id="clientesPorModalidade" name="clientesFiltro"
                   [(ngModel)]="clientesFiltro" value="porModalidade" />
            <label class="form-check-label" for="clientesPorModalidade">Clientes por modalidade</label>
          </div>
          <div *ngIf="clientesFiltro === 'porModalidade'" class="mt-2">
            <label for="modalidadesSelect" class="form-label me-2">Escolha as modalidades:</label>
            <select id="modalidadesSelect" class="form-select d-inline-block w-auto" multiple
                  [(ngModel)]="modalidadesSelecionadas">
              <option *ngFor="let modalidade of modalidadesDisponiveis"
                    [value]="modalidade.id">
                    {{ modalidade.nome }} — {{ modalidade.descricao }}
              </option>
          </select>
          </div>
        </div>

        <!-- Seleção resumida -->
        <div *ngIf="relatorioPreparado" class="selected-report-list mt-3 mb-5">
          <h6>Itens selecionados para o relatório:</h6>
          <ul>
            <li *ngIf="selectedReportType === 'cobrancas'">
              <ng-container *ngIf="cobrancasPagas">
                <span class="selected-report-badge success">Cobranças pagas</span>
              </ng-container>
              <ng-container *ngIf="cobrancasFeitas">
                <span class="selected-report-badge info">Cobranças feitas</span>
              </ng-container>
              <ng-container *ngIf="cobrancasPagasMes">
                <span class="selected-report-badge warning">Cobranças pagas no mês</span>
              </ng-container>
            </li>

            <li *ngIf="selectedReportType === 'clientes'">
              <ng-container *ngIf="clientesAtivos">
                <span class="selected-report-badge success">Clientes ativos</span>
              </ng-container>
              <ng-container *ngIf="clientesInativos">
                <span class="selected-report-badge secondary">Clientes inativos</span>
              </ng-container>
              <!-- NOVO: faixa etária -->
              <ng-container *ngIf="clientesPorFaixaEtaria && faixaValida()">
                <span class="selected-report-badge warning">
                  com faixa etária entre: {{ faixaEtariaLabel() }}
                </span>
              </ng-container>
            </li>

            <ng-container *ngIf="clientesFiltro === 'porModalidade' && modalidadesSelecionadas.length">
              <span class="selected-report selected-mod-label">inscritos em:</span>
              <span *ngFor="let m of selecionadas()" class="selected-report-badge selected-mod">
                {{ m.nome }}
              </span>
            </ng-container>
          </ul>
        </div>

        <div class="mt-3">
          <button class="btn btn-primary me-2" (click)="prepararRelatorio()">Preparar</button>
          <button class="btn btn-success me-2" [disabled]="!relatorioPreparado" (click)="confirmarRelatorio()">Confirmar</button>
          <button class="btn btn-outline-secondary" (click)="ngOnInit()">Limpar</button>
        </div>

        <div class="table-responsive">
          <table class="table table-striped align-middle"></table>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mt-3">
      <div class="card-body">
        <!-- loading -->
        <div class="mt-3" *ngIf="loading">
          <span class="spinner-border spinner-border-sm me-2"></span> Carregando…
        </div>

        <!-- resultado clientes -->
        <div class="table-responsive" *ngIf="!loading && selectedReportType==='clientes' && resultado.length">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th class="text-center"># Modalidades</th>
                <th>Cidades</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of resultado">
                <td class="text-truncate">{{ c.nome }}</td>
                <td class="text-truncate">{{ c.email }}</td>
                <td>{{ c.telefone || '-' }}</td>
                <td class="text-center">{{ c.quantidadeModalidades }}</td>
                <td class="text-truncate">{{ c.enderecosResumo || (c.cidades?.join(' | ') || '-') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="text-muted" *ngIf="!loading && selectedReportType==='clientes' && !resultado.length && relatorioPreparado">
          Nenhum cliente encontrado com os filtros informados.
        </div>

      </div>
    </div>
  </div>
  `
})
export class ClientesReportComponent {
  usuarios: UsuarioSummary[] = [];
  resultado: ClienteSummary[] = [];
  loading = false;

  selectedReportType: string = 'cobrancas';

  // Cobranças
  cobrancasPagas = false;
  cobrancasFeitas = false;
  cobrancasPagasMes = false;

  // Clientes
  clientesAtivos = false;
  clientesInativos = false;

  // Faixa etária
  clientesPorFaixaEtaria = false;
  faixaEtariaInicial: number | null = null;
  faixaEtariaFinal: number | null = null;

  // Modalidades
  clientesFiltro = '';
  modalidadesSelecionadas: number[] = [];
  modalidadesDisponiveis: Modalidade[] = [];

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  relatorioPreparado = false;

  constructor(
    private svc: ClienteService,
    private notify: NotificationService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.limparTodosFiltros();
    this.svc.fetchAll().subscribe();
    this.loadModalidades();
  }

  prepararRelatorio() {
    if (this.selectedReportType === 'cobrancas') {
      this.relatorioPreparado = this.cobrancasPagas || this.cobrancasFeitas || this.cobrancasPagasMes;
      return;
    }

    if (this.selectedReportType === 'clientes') {
      const byModalidade = this.clientesFiltro === 'porModalidade' && this.modalidadesSelecionadas.length > 0;
      const byFaixa = this.clientesPorFaixaEtaria && this.faixaValida();
      this.relatorioPreparado = this.clientesAtivos || this.clientesInativos || byModalidade || byFaixa;
      return;
    }

    this.relatorioPreparado = false;
  }

  confirmarRelatorio() {
    if (this.selectedReportType !== 'clientes') {
      this.notify.success('Relatório confirmado!');
      return;
    }

    // precisa ter algo selecionado
    const byModalidade = this.clientesFiltro === 'porModalidade' && this.modalidadesSelecionadas.length > 0;
    const byFaixa = this.clientesPorFaixaEtaria && this.faixaValida();
    const temFiltros = this.clientesAtivos || this.clientesInativos || byModalidade || byFaixa;

    if (!temFiltros) {
      this.notify.warn('Selecione ao menos um filtro de clientes.');
      return;
    }

    this.loading = true;
    this.svc.reportClientes({
      ativos: this.clientesAtivos ? true : undefined,
      inativos: this.clientesInativos ? true : undefined,
      idadeMin: byFaixa ? this.faixaEtariaInicial ?? undefined : undefined,
      idadeMax: byFaixa ? this.faixaEtariaFinal ?? undefined : undefined,
      modalidadeIds: byModalidade ? this.modalidadesSelecionadas : undefined
    }).subscribe({
      next: list => {
        this.resultado = list ?? [];
        if (!this.resultado.length) this.notify.warn('Nenhum cliente encontrado com os filtros informados.');
        else this.notify.success('Relatório de clientes pronto!');
      },
      error: () => this.notify.error('Falha ao buscar relatório de clientes.'),
    }).add(() => this.loading = false);
  }


  limparTodosFiltros() {
    this.selectedReportType = 'cobrancas';
    this.cobrancasPagas = this.cobrancasFeitas = this.cobrancasPagasMes = false;
    this.clientesAtivos = this.clientesInativos = false;
    this.clientesPorFaixaEtaria = false;
    this.faixaEtariaInicial = this.faixaEtariaFinal = null;
    this.clientesFiltro = '';
    this.modalidadesSelecionadas = [];
    this.relatorioPreparado = false;
    this.resultado = [];
  }


  // ====== MODALIDADES ======
  private loadModalidades() {
    this.svc.getModalidades().subscribe({
      next: (list: Modalidade[]) => this.modalidadesDisponiveis = list ?? [],
      error: () => {
        this.notify.error('Falha ao carregar modalidades.');
        this.modalidadesDisponiveis = [];
      },
    });
  }

  selecionadas() {
    const set = new Set(this.modalidadesSelecionadas);
    return this.modalidadesDisponiveis.filter(m => set.has(m.id));
  }

  // ====== Faixa etária helpers ======
  faixaValida(): boolean {
    const min = this.faixaEtariaInicial;
    const max = this.faixaEtariaFinal;
    const hasMin = typeof min === 'number' && Number.isFinite(min) && min >= 0;
    const hasMax = typeof max === 'number' && Number.isFinite(max) && max >= 0;

    if (!hasMin && !hasMax) return false;
    if (hasMin && hasMax && max! < min!) return false;
    return true;
  }

  faixaEtariaLabel(): string {
    const min = this.faixaEtariaInicial;
    const max = this.faixaEtariaFinal;
    const hasMin = typeof min === 'number' && Number.isFinite(min) && min >= 0;
    const hasMax = typeof max === 'number' && Number.isFinite(max) && max >= 0;

    if (hasMin && hasMax) return `${min} e ${max} anos`;
    if (hasMin && !hasMax) return `${min}+ anos`;
    if (!hasMin && hasMax) return `até ${max} anos`;
    return '';
  }
}
