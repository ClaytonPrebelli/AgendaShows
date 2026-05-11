import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface DialogField {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}

export interface CreateEntityData {
  title: string;
  fields: DialogField[];
  initialValue?: string;
}

@Component({
  selector: 'app-create-entity-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-entity-dialog.component.html',
  styleUrl: './create-entity-dialog.component.scss',
})
export class CreateEntityDialogComponent implements OnInit {
  form: FormGroup;
  fields: DialogField[];

  constructor(
    @Inject(DIALOG_DATA) public data: CreateEntityData,
    private dialogRef: DialogRef<Record<string, string>, CreateEntityDialogComponent>,
    private fb: FormBuilder,
  ) {
    this.fields = data.fields || [];
    const controls: Record<string, any> = {};
    for (const field of this.fields) {
      const value = field.key === 'nome' && data.initialValue ? data.initialValue : '';
      controls[field.key] = [value, field.required ? Validators.required : []];
    }
    this.form = this.fb.group(controls);
  }

  ngOnInit(): void {
    if (this.fields.length > 0 && this.data.initialValue) {
      const firstField = this.fields[0];
      if (firstField && !this.form.get(firstField.key)?.value) {
        this.form.patchValue({ [firstField.key]: this.data.initialValue });
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  close(): void {
    this.dialogRef.close();
  }
}
