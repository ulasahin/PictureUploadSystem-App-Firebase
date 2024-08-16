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
  uploadProgress: number = 0;
  downloadURL: string | undefined;
  isUploading: boolean = false; 

  constructor(private storage: AngularFireStorage) {}

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  onUpload() {
    if (this.selectedFiles.length > 0) {
      this.isUploading = true;
      let selectedFilesSize = this.selectedFiles.length;
      let uploadedSizeFile = 0; 
      this.selectedFiles.forEach(file => {
        const filePath = `uploads/${Date.now()}_${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);
        

        task.percentageChanges().subscribe(progress => {
          this.uploadProgress = progress || 0;
          console.log(`File is ${this.uploadProgress}% uploaded.`);
        });

        task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              this.downloadURL = url;
              console.log('File available at', this.downloadURL);
              uploadedSizeFile++;


            });
          })
        ).subscribe();
        
      
      });
      let intervalId = setInterval(()=> {
        if (uploadedSizeFile == selectedFilesSize) {
          clearInterval(intervalId);
          alert("Yükleme Başarılı. ♥ Teşekkür Ederiz ♥");
          window.location.reload();
        }
      },1000)
    }
  }
}
