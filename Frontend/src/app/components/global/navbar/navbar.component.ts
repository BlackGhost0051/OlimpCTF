import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ShortUserProfile} from '../../../models/user';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{

  user: ShortUserProfile | undefined = undefined;

  ngOnInit() {
    this.loadUserInfo();
  }


  loadUserInfo(): void {

  }
}
