import { Component, OnInit, ViewChild } from '@angular/core';
import { ZipService } from 'src/app/service/zip/zip.service';
import { ZipEntry } from 'src/app/service/zip/ZipEntry';
@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css'],
})
export class ReaderComponent implements OnInit {
  @ViewChild('bookArea') bookArea;

  filePath = 'assets/TheDefeatedDragon.epub';
  constructor(private zip: ZipService) {}

  curData;

  ngOnInit(): void {}
  fileChanged(event) {
    const file = event.target.files[0];
    this.zip.getEntries(file).subscribe((data: ZipEntry[]) => {
      // console.log(data);
      for (let i = 0; i < data.length; i++) {
        //img = .png
        //htmls = ".xhtml"
        //directory = nav.xhtml
        const name = data[i].filename;
        if (name.includes('.png')) {
          this.loadImg(data[i]);
        } else if (name.includes('.xhtml')) {
          if (name.includes('nav.xhtml')) {
            this.loadIndex(data[i]);
          } else {
            this.loadContent(data[i]);
          }
        }
      }
    });
  }
  loadImg(obj: ZipEntry) {
    // console.log('Its the Img');
  }
  loadIndex(obj: ZipEntry) {
    // console.log('Its the Index');
  }
  loadContent(obj: ZipEntry) {
    console.log(obj);

    let data = this.zip.getData(obj);
    console.log(data);

    data.data.subscribe((o) => {
      let reader = new FileReader();
      console.log(o);

      // reader.addEventListener('loaded', (e) => {
      //   const text = e.srcElement.addEventListener();
      //   console.log(text);
      // });
      reader.onload = () => {
        console.log(reader.result);
        this.curData = reader.result;
      };
      // reader.readAsBinaryString(o);
      reader.readAsText(o);
    });
  }
  loadBook() {
    this.zip.getEntries(this.filePath).subscribe((data) => {
      console.log(data);
    });
  }
}
