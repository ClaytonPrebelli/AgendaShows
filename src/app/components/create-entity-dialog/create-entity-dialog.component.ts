import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface CreateEntityData {
  title: string;
  fieldLabel: string;
  fieldPlaceholder: string;
}

@Component({
  selector: 'app-create-entity-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-entity-dialog.component.html',
  styleUrl: './create-entity-dialog.component.scss',
})
export class CreateEntityDialogComponent {
  form: FormGroup;

  constructor(
    @Inject(DIALOG_DATA) public data: CreateEntityData,
    private dialogRef: DialogRef<{ nome: string }, CreateEntityDialogComponent>,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close({ nome: this.form.value.nome });
  }

  close(): void {
    this.dialogRef.close();
  }
}
