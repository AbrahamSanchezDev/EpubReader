import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReaderComponent } from './component/reader/reader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('epub-reader');
}
