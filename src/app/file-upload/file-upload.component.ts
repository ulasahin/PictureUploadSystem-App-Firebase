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
  uploadProgress: number[] = [];
  downloadURLs: string[] = [];
  isUploading: boolean = false;

  constructor(private storage: AngularFireStorage) {}

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
    this.uploadProgress = new Array(this.selectedFiles.length).fill(0); // Yükleme ilerlemesini sıfırlayın
  }

  onUpload() {
    if (this.selectedFiles.length > 0) {
      this.isUploading = true;
      let uploadedFilesCount = 0;

      this.selectedFiles.forEach((file, index) => {
        const filePath = `uploads/${Date.now()}_${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        // Yükleme yüzdesini takip et
        task.percentageChanges().subscribe(progress => {
          this.uploadProgress[index] = progress || 0;
          console.log(`File ${file.name} is ${this.uploadProgress[index]}% uploaded.`);
        });

        task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              this.downloadURLs[index] = url;
              console.log('File available at', url);
              uploadedFilesCount++;

              // Tüm dosyalar yüklendiğinde
              if (uploadedFilesCount === this.selectedFiles.length) {
                this.isUploading = false;
                alert("Yükleme Başarılı. ♥ Teşekkür Ederiz ♥");
                window.location.reload();
              }
            });
          })
        ).subscribe();
      });
    }
  }
}
