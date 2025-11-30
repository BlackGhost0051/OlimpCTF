import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ShortUserProfile} from '../../../models/user';
import {UserService} from '../../../services/user/user.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{

  showProfileMenu: boolean = false;
  user: ShortUserProfile | undefined = undefined;


  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  profileMenuToggled(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }


  loadUserInfo(): void {
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        if(profile){
          this.user = {
            login: profile.login,
            icon: profile.icon,
          };
        }
      },
      error: () => {
        this.user = undefined;
      }
    });
  }



  onLogoutToggled(): void{
    this.userService.logout();
    this.loadUserInfo();
  }
}
