import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../services/user/user.service';
import {UserProfile} from '../../models/user';
import {CommonModule} from '@angular/common';
import {StatisticsRadarChartComponent} from '../statistics-radar-chart/statistics-radar-chart.component';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-profile',
  imports: [CommonModule, StatisticsRadarChartComponent],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy{
  userProfile?: UserProfile;
  loading: boolean = true;
  error?: string;
  targetLogin?: string;
  isOwnProfile: boolean = false;
  private routeParamsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    console.log('ngOnInit - loading:', this.loading, 'error:', this.error);
    this.routeParamsSubscription = this.route.params.subscribe(params => {
      this.targetLogin = params['login'];
      this.loadUserProfile();
    });
  }

  ngOnDestroy() {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
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

  goToEditProfile() {
    this.router.navigate(['/profile-edit']);
  }
}
