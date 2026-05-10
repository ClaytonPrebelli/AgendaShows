import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { ShowService } from '../../services/show.service';
import { ContratanteService } from '../../services/contratante.service';
import { LocalService } from '../../services/local.service';
import { Show, FORMAS_PAGAMENTO, ESTILOS_MUSICAIS } from '../../models/show.model';
import { Contratante } from '../../models/contratante.model';
import { Local } from '../../models/local.model';
import { AutocompleteFieldComponent } from '../../components/autocomplete-field/autocomplete-field.component';
import { CreateEntityDialogComponent, CreateEntityData } from '../../components/create-entity-dialog/create-entity-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-show-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AutocompleteFieldComponent],
  templateUrl: './show-form.component.html',
  styleUrl: './show-form.component.scss',
})
export class ShowFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isEditing = false;
  editId: number | null = null;
  formasPagamento = FORMAS_PAGAMENTO;
  estilosMusicais = ESTILOS_MUSICAIS;
  selectedEstilos: string[] = [];
  selectedContratante: Contratante | null = null;
  selectedLocal: Local | null = null;
  initialContratanteNome = '';
  initialLocalNome = '';
  private destroy$ = new Subject<void>();

  searchContratantes = (term: string) => this.contratanteService.search(term);
  searchLocais = (term: string) => this.localService.search(term);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private showService: ShowService,
    private contratanteService: ContratanteService,
    private localService: LocalService,
    private dialog: Dialog,
  ) {
    this.form = this.fb.group({
      data: ['', Validators.required],
      hora: ['', Validators.required],
      duracao: ['', Validators.required],
      valorCobrado: [null, [Validators.required, Validators.min(0)]],
      pago: [false],
      dataPagamento: [''],
      formaPagamento: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    const dataParam = this.route.snapshot.queryParams['data'];

    if (dataParam && !id) {
      this.form.patchValue({ data: dataParam });
    }

    if (id) {
      this.isEditing = true;
      this.editId = +id;
      this.showService
        .getById(this.editId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(show => {
          if (show) {
            this.form.patchValue(show);
            this.selectedEstilos = [...show.estilosSolicitados];
            this.initialContratanteNome = show.contratanteNome;
            this.initialLocalNome = show.localNome;
            this.selectedContratante = { id: show.contratanteId, nome: show.contratanteNome };
            this.selectedLocal = { id: show.localId, nome: show.localNome };
            if (show.dataPagamento) {
              this.form.patchValue({ dataPagamento: show.dataPagamento });
            }
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    const dialogRef = this.dialog.open(CreateEntityDialogComponent, {
      data: {
        title: 'Novo Contratante',
        fieldLabel: 'Nome do Contratante',
        fieldPlaceholder: 'Digite o nome do contratante',
      } as CreateEntityData,
    });

    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result) {
        this.contratanteService.create({ nome: result.nome }).pipe(takeUntil(this.destroy$)).subscribe(c => {
          this.selectedContratante = c;
        });
      }
    });
  }

  openAddLocal(): void {
    const dialogRef = this.dialog.open(CreateEntityDialogComponent, {
      data: {
        title: 'Novo Local',
        fieldLabel: 'Nome do Local',
        fieldPlaceholder: 'Digite o nome do local',
      } as CreateEntityData,
    });

    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result) {
        this.localService.create({ nome: result.nome }).pipe(takeUntil(this.destroy$)).subscribe(l => {
          this.selectedLocal = l;
        });
      }
    });
  }

  onSubmit(): void {
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

    const request$ =
      this.isEditing && this.editId
        ? this.showService.update({ id: this.editId, ...data, createdAt: '' })
        : this.showService.create(data);

    request$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
