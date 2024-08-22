import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedFiles: File[] = [];
  totalUploadProgress: number = 0;
  isUploading: boolean = false;
  showProgressBar: boolean = false;

  constructor(private storage: AngularFireStorage) {}

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
    this.showProgressBar = this.selectedFiles.length > 0;
    this.totalUploadProgress = 0; 
  }

  onUpload() {
    if (this.selectedFiles.length > 0) {
      this.isUploading = true;
      let totalFiles = this.selectedFiles.length;
      let uploadedFiles = 0;

      this.selectedFiles.forEach(file => {
        const filePath = `uploads/${Date.now()}_${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        task.percentageChanges().subscribe(progress => {
          if (progress) {
            this.totalUploadProgress = ((uploadedFiles * 100) + progress) / totalFiles;
          }
        });

        task.snapshotChanges().pipe(
          finalize(() => {
            uploadedFiles++;
            if (uploadedFiles === totalFiles) {
              this.isUploading = false;
              this.showProgressBar = false; 
              alert("Yükleme Başarılı. ♥ Teşekkür Ederiz ♥");
              window.location.reload();
            }
          })
        ).subscribe();
      });
    }
  }
}
