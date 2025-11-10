import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../services/user/user.service';
import {UserProfile} from '../../models/user';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, AfterViewInit{
  userProfile?: UserProfile;
  loading: boolean = true;
  error?: string;
  targetLogin?: string;
  isOwnProfile: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.targetLogin = params['login'];
      this.loadUserProfile();
    });
  }

  ngAfterViewInit() {
  }

  private loadUserProfile() {
    this.loading = true;
    this.error = undefined;

    this.userService.getUserProfile(this.targetLogin).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.isOwnProfile = !this.targetLogin;
        this.loading = false;
      },
      error: (err) => {
        this.error = this.targetLogin
          ? `Failed to load profile for user ${this.targetLogin}`
          : 'Failed to load profile';
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  togglePrivacy() {
    if (!this.userProfile || !this.isOwnProfile) return;

    const newPrivacySetting = !this.userProfile.isPrivate;

    this.userService.updatePrivacy(newPrivacySetting).subscribe({
      next: () => {
        if (this.userProfile) {
          this.userProfile.isPrivate = newPrivacySetting;
        }
      },
      error: (err) => {
        console.error('Error updating privacy settings:', err);
        alert('Failed to update privacy settings');
      }
    });
  }

  goToEditProfile() {
    this.router.navigate(['/profile-edit']);
  }
}
