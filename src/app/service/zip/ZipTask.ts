import { Observable } from 'rxjs';
import { ZipTaskProgress } from './ZipTaskProgress';

export interface ZipTask {
  progress: Observable<ZipTaskProgress>;
  data: Observable<Blob>;
}
