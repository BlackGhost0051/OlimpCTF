import {AfterViewInit, Component, ViewChild, ViewContainerRef} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements AfterViewInit{
  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.router.navigate(['/home']);
    // this.router.navigate(['/welcome']);
    // this.router.navigate(['/dashboard']);
  }

}
