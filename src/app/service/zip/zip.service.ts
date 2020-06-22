import { Injectable } from '@angular/core';
import { ZipEntry } from './ZipEntry';
import { ZipTaskProgress } from './ZipTaskProgress';
import { Observable, Subject } from 'rxjs';
import { ZipTask } from './ZipTask';

// This is added globally by the zip.js library
declare const zip: any;
@Injectable({
  providedIn: 'root',
})
export class ZipService {
  constructor() {}
  //Gets the zip files and return them as entry data
  getEntries(file): Observable<Array<ZipEntry>> {
    zip.workerScriptsPath = 'assets/js/';
    return new Observable((subscriber) => {
      const reader = new zip.BlobReader(file);
      zip.createReader(
        reader,
        (zipReader) => {
          zipReader.getEntries((entries) => {
            subscriber.next(entries);
            subscriber.complete();
          });
        },
        (message) => {
          console.log('Fail to load');
          subscriber.error({ message });
        }
      );
    });
  }

  getData(entry: ZipEntry): ZipTask {
    const progress = new Subject<ZipTaskProgress>();
    const data = new Observable<Blob>((subscriber) => {
      const writer = new zip.BlobWriter();

      // Using `as any` because we don't want to expose this
      // method in the interface
      (entry as any).getData(
        writer,
        (blob) => {
          subscriber.next(blob);
          subscriber.complete();
          progress.next(null);
        },
        (current, total) => {
          progress.next({ active: true, current, total });
        }
      );
    });
    return { progress, data };
  }
}
