import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef, Dialog } from '@angular/cdk/dialog';
import { ShowService } from '../../services/show.service';
import { ContratanteService } from '../../services/contratante.service';
import { LocalService } from '../../services/local.service';
import { Show, FORMAS_PAGAMENTO, ESTILOS_MUSICAIS } from '../../models/show.model';
import { Contratante } from '../../models/contratante.model';
import { Local } from '../../models/local.model';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AutocompleteFieldComponent } from '../../components/autocomplete-field/autocomplete-field.component';
import { CreateEntityDialogComponent, CreateEntityData } from '../../components/create-entity-dialog/create-entity-dialog.component';
import { Subject, takeUntil } from 'rxjs';

export interface ModalData {
  mode: 'add' | 'view';
  date?: string;
  show?: Show;
}

export interface ModalResult {
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
}

@Component({
  selector: 'app-show-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, AutocompleteFieldComponent],
  templateUrl: './show-modal.component.html',
  styleUrl: './show-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ShowModalComponent implements OnInit, OnDestroy {
  mode: 'add' | 'view';
  show: Show | null;
  form: FormGroup;
  formasPagamento = FORMAS_PAGAMENTO;
  estilosMusicais = ESTILOS_MUSICAIS;
  selectedEstilos: string[] = [];
  isEditing = false;
  selectedContratante: Contratante | null = null;
  selectedLocal: Local | null = null;

  searchContratantes = (term: string) => this.contratanteService.search(term);
  searchLocais = (term: string) => this.localService.search(term);

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(DIALOG_DATA) public data: ModalData,
    private dialogRef: DialogRef<ModalResult>,
    private dialog: Dialog,
    private fb: FormBuilder,
    private showService: ShowService,
    private contratanteService: ContratanteService,
    private localService: LocalService,
  ) {
    this.mode = data.mode;
    this.show = data.show || null;

    this.form = this.fb.group({
      data: [data.date || '', Validators.required],
      hora: ['', Validators.required],
      duracao: ['', Validators.required],
      valorCobrado: [null, [Validators.required, Validators.min(0)]],
      pago: [false],
      dataPagamento: [''],
      formaPagamento: [''],
    });
  }

  ngOnInit(): void {
    if (this.mode === 'view' && this.show) {
      this.form.patchValue(this.show);
      this.selectedEstilos = [...this.show.estilosSolicitados];
      this.selectedContratante = { id: this.show.contratanteId, nome: this.show.contratanteNome };
      this.selectedLocal = { id: this.show.localId, nome: this.show.localNome };
      if (this.show.dataPagamento) {
        this.form.patchValue({ dataPagamento: this.show.dataPagamento });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.dialogRef.close();
  }

  toggleEstilo(estilo: string): void {
    const idx = this.selectedEstilos.indexOf(estilo);
    if (idx >= 0) {
      this.selectedEstilos.splice(idx, 1);
    } else {
      this.selectedEstilos.push(estilo);
    }
  }

  onContratanteSelected(contratante: Contratante | null): void {
    this.selectedContratante = contratante;
  }

  onLocalSelected(local: Local | null): void {
    this.selectedLocal = local;
  }

  openAddContratante(): void {
    const ref = this.dialog.open(CreateEntityDialogComponent, {
      data: {
        title: 'Novo Contratante',
        fieldLabel: 'Nome do Contratante',
        fieldPlaceholder: 'Digite o nome do contratante',
      } as CreateEntityData,
    });

    ref.closed.pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result) {
        this.contratanteService.create({ nome: result.nome }).pipe(takeUntil(this.destroy$)).subscribe(c => {
          this.selectedContratante = c;
        });
      }
    });
  }

  openAddLocal(): void {
    const ref = this.dialog.open(CreateEntityDialogComponent, {
      data: {
        title: 'Novo Local',
        fieldLabel: 'Nome do Local',
        fieldPlaceholder: 'Digite o nome do local',
      } as CreateEntityData,
    });

    ref.closed.pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result) {
        this.localService.create({ nome: result.nome }).pipe(takeUntil(this.destroy$)).subscribe(l => {
          this.selectedLocal = l;
        });
      }
    });
  }

  onAdd(): void {
    if (this.form.invalid) return;
    if (!this.selectedContratante || !this.selectedLocal) return;
    const value = this.form.value;
    const data: Omit<Show, 'id' | 'createdAt'> = {
      contratanteId: this.selectedContratante.id,
      contratanteNome: this.selectedContratante.nome,
      localId: this.selectedLocal.id,
      localNome: this.selectedLocal.nome,
      data: value.data,
      hora: value.hora,
      duracao: value.duracao,
      valorCobrado: value.valorCobrado,
      pago: value.pago,
      dataPagamento: value.pago
        ? value.dataPagamento || new Date().toISOString().split('T')[0]
        : undefined,
      formaPagamento: value.formaPagamento,
      estilosSolicitados: this.selectedEstilos,
    };

    this.showService
      .create(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dialogRef.close({ created: true });
      });
  }

  onEdit(): void {
    if (this.form.invalid) return;
    if (!this.show?.id) return;
    if (!this.selectedContratante || !this.selectedLocal) return;
    const value = this.form.value;
    const data: Show = {
      id: this.show.id,
      contratanteId: this.selectedContratante.id,
      contratanteNome: this.selectedContratante.nome,
      localId: this.selectedLocal.id,
      localNome: this.selectedLocal.nome,
      data: value.data,
      hora: value.hora,
      duracao: value.duracao,
      valorCobrado: value.valorCobrado,
      pago: value.pago,
      dataPagamento: value.pago
        ? value.dataPagamento || new Date().toISOString().split('T')[0]
        : undefined,
      formaPagamento: value.formaPagamento,
      estilosSolicitados: this.selectedEstilos,
      createdAt: this.show.createdAt,
    };

    this.showService
      .update(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dialogRef.close({ updated: true });
      });
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.show) {
      this.form.patchValue(this.show);
      this.selectedEstilos = [...this.show.estilosSolicitados];
      this.selectedContratante = { id: this.show.contratanteId, nome: this.show.contratanteNome };
      this.selectedLocal = { id: this.show.localId, nome: this.show.localNome };
      if (this.show.dataPagamento) {
        this.form.patchValue({ dataPagamento: this.show.dataPagamento });
      }
    }
  }

  togglePago(): void {
    if (!this.show?.id) return;
    this.showService
      .togglePago(this.show.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(updated => {
        this.show = updated;
        if (this.show) {
          this.form.patchValue(this.show);
          this.selectedContratante = { id: this.show.contratanteId, nome: this.show.contratanteNome };
          this.selectedLocal = { id: this.show.localId, nome: this.show.localNome };
          if (this.show.dataPagamento) {
            this.form.patchValue({ dataPagamento: this.show.dataPagamento });
          }
        }
      });
  }

  deleteShow(): void {
    if (!this.show?.id) return;
    if (confirm('Tem certeza que deseja excluir este show?')) {
      this.showService
        .delete(this.show.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.dialogRef.close({ deleted: true });
        });
    }
  }
}
