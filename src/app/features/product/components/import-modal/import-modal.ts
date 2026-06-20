import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Modal } from '../../../../shared/components/modal/modal';
import { Button } from '../../../../shared/components/button/button';
import { ProductService, ImportResult } from '../../services/product.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-import-modal',
  standalone: true,
  imports: [CommonModule, Modal, Button],
  templateUrl: './import-modal.html',
})
export class ImportModal {
  @Output() close = new EventEmitter<boolean>();

  private productService = inject(ProductService);
  private toast = inject(HotToastService);

  step = signal<'upload' | 'result'>('upload');
  isUploading = signal(false);
  result = signal<ImportResult | null>(null);
  selectedFile = signal<File | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
  }

  downloadTemplate() {
    const header = 'Nombre,SKU,Código de Barras,Precio de Venta,Precio de Costo,Stock,Stock Mínimo';
    const example1 = 'Perfume Floral 50ml,PRF001,7790001234001,1500,800,10,2';
    const example2 = 'Crema Hidratante,CRM001,7790001234002,850,420,20,5';
    const csv = `${header}\n${example1}\n${example2}`;
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-productos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  upload() {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);

    this.productService.importProducts(file).subscribe({
      next: (res) => {
        this.result.set(res);
        this.step.set('result');
        this.isUploading.set(false);
      },
      error: (err) => {
        this.isUploading.set(false);
        this.toast.error(err.error?.message || 'Error al importar el archivo.');
      }
    });
  }

  onClose() {
    const imported = (this.result()?.created ?? 0) > 0;
    this.close.emit(imported);
  }

  reset() {
    this.step.set('upload');
    this.selectedFile.set(null);
    this.result.set(null);
  }
}
