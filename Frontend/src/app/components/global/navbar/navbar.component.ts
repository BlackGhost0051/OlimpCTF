import {Component, OnInit, OnDestroy} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ShortUserProfile} from '../../../models/user';
import {UserService} from '../../../services/user/user.service';
import {AuthService} from '../../../services/auth/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy{

  showProfileMenu: boolean = false;
  user: ShortUserProfile | undefined = undefined;
  private authSubscription?: Subscription;


  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.authSubscription = this.authService.authState$.subscribe(() => {
      this.loadUserInfo();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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
        } else {
          this.user = undefined;
        }
      },
      error: () => {
        this.user = undefined;
      }
    });
  }



  onLogoutToggled(): void{
    this.userService.logout();
  }
}
