import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThreeDMountainsComponent } from '../three-d-mountains/three-d-mountains.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ThreeDMountainsComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {

}
