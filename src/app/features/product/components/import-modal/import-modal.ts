import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Modal } from '../../../../shared/components/modal/modal';
import { Button } from '../../../../shared/components/button/button';
import { ProductService, ImportResult } from '../../services/product.service';
import { HotToastService } from '@ngxpert/hot-toast';
// Legacy .xls is not supported by the backend parser; Excel saves .xlsx by default
const ALLOWED_EXTENSIONS = ['.xlsx', '.csv'];
const TEMPLATE_URL = '/plantilla-productos.xlsx';
// Same limit as the backend upload interceptor
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function validateImportFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext))) {
    return 'Formato no soportado. Subí un archivo .xlsx o .csv.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'El archivo supera los 5 MB permitidos.';
  }
  if (file.size === 0) {
    return 'El archivo está vacío.';
  }
  return null;
}

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

    if (file) {
      const error = validateImportFile(file);
      if (error) {
        this.toast.error(error);
        input.value = '';
        this.selectedFile.set(null);
        return;
      }
    }

    this.selectedFile.set(file);
  }

  downloadTemplate() {
    const link = document.createElement('a');
    link.href = TEMPLATE_URL;
    link.download = 'plantilla-productos.xlsx';
    link.click();
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
