import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from '../../../../shared/components/button/button';
import { Modal } from '../../../../shared/components/modal/modal';
import { Client, CreateClientDto, UpdateClientDto } from '../../../../core/models/client.model';
import { ClientsService } from '../../services/clients.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-client-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, Button, Modal],
  templateUrl: './client-form-modal.html'
})
export class ClientFormModal implements OnInit {
  @Input() visible = false;
  @Input() client: Client | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);
  private toast = inject(HotToastService);
  private translate = inject(TranslateService);

  form!: FormGroup;
  isSaving = false;

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges() {
    if (this.visible && this.form) {
      this.initForm();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: [this.client?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [this.client?.email || '', [Validators.email]],
      phone: [this.client?.phone || '']
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const data = this.form.value;

    const request$ = this.client
      ? this.clientsService.update(this.client.id, data as UpdateClientDto)
      : this.clientsService.create(data as CreateClientDto);

    request$.pipe(
      this.toast.observe({
        loading: this.client ? this.translate.instant('TOAST.UPDATING_CLIENT') : this.translate.instant('TOAST.CREATING_CLIENT'),
        success: this.client ? this.translate.instant('TOAST.CLIENT_UPDATED') : this.translate.instant('TOAST.CLIENT_CREATED'),
        error: this.translate.instant('TOAST.ERROR_SAVING_CLIENT')
      }),
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: () => this.save.emit()
    });
  }
}
