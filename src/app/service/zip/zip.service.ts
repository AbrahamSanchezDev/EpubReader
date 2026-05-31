import { Injectable } from '@angular/core';
import { ZipEntry } from './ZipEntry';
import { ZipTaskProgress } from './ZipTaskProgress';
import { Observable, Subject } from 'rxjs';
import { ZipTask } from './ZipTask';
import * as JSZip from 'jszip';

@Injectable({
  providedIn: 'root',
})
export class ZipService {
  // Gets the zip files and returns them as entry data
  getEntries(file: Blob): Observable<ZipEntry[]> {
    console.log('Getting entries from zip file', file);

    return new Observable((subscriber) => {
      JSZip.loadAsync(file)
        .then((zipFile) => {
          const entries: ZipEntry[] = [];
          zipFile.forEach((relativePath, zipObject) => {
            const entry: ZipEntry & {
              getData: (
                writer: unknown,
                onComplete: (blob: Blob) => void,
                onProgress?: (current: number, total: number) => void
              ) => void;
            } = {
              version: 0,
              bitFlag: 0,
              compressionMethod: 0,
              lastModDateRaw: zipObject.date ? zipObject.date.getTime() : 0,
              lastModDate: zipObject.date ? zipObject.date.toISOString() : '',
              crc32: 0,
              compressedSize: 0,
              uncompressedSize: 0,
              filenameLength: relativePath.length,
              extraFieldLength: 0,
              commentLength: zipObject.comment?.length ?? 0,
              directory: zipObject.dir,
              offset: 0,
              filename: relativePath,
              comment: zipObject.comment ?? '',
              getData: (_writer, onComplete, onProgress) => {
                zipObject.async('blob', (metadata) => {
                  if (onProgress) {
                    onProgress(metadata.percent, 100);
                  }
                })
                .then((blob) => onComplete(blob))
                .catch((error) => {
                  console.error('Zip entry read error', error);
                });
              },
            };
            entries.push(entry);
          });
          subscriber.next(entries);
          subscriber.complete();
        })
        .catch((error) => {
          console.error('Fail to load zip file', error);
          subscriber.error({ message: error });
        });
    });
  }

  getData(entry: ZipEntry): ZipTask {
    const progress = new Subject<ZipTaskProgress>();

    const data = new Observable<Blob>((subscriber) => {
      const getData = (entry as unknown as {
        getData: (
          writer: unknown,
          onComplete: (blob: Blob) => void,
          onProgress?: (current: number, total: number) => void
        ) => void;
      }).getData;

      if (!getData) {
        subscriber.complete();
        return;
      }

      getData(
        null,
        (blob: Blob) => {
          subscriber.next(blob);
          subscriber.complete();
          progress.next({ active: false });
        },
        (current: number, total: number) => {
          progress.next({ active: true, current, total });
        }
      );
    });

    return { progress, data };
  }
}
