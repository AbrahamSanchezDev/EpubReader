import { Component, OnInit, ViewChild } from '@angular/core';
import { ZipService } from 'src/app/service/zip/zip.service';
@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css'],
})
export class ReaderComponent implements OnInit {
  @ViewChild('bookArea') bookArea;

  filePath = 'assets/TheDefeatedDragon.epub';
  constructor(private zip: ZipService) {}

  ngOnInit(): void {}
  fileChanged(event) {
    const file = event.target.files[0];
    this.zip.getEntries(file).subscribe((data) => {
      console.log(data);
    });
  }
  loadBook() {
    this.zip.getEntries(this.filePath).subscribe((data) => {
      console.log(data);
    });
  }
}
