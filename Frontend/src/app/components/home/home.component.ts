import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FooterComponent} from '../global/footer/footer.component';
import {ChallengeService} from '../../services/challenge/challenge.service';


@Component({
  selector: 'app-home',
  imports: [CommonModule, FooterComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  categories: any[] = [];
  statistics = {
    activePlayers: 0,
    challenges: 0,
    countries: 0,
    guides: 0
  };

  constructor(
    private challengeService: ChallengeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.challengeService.getCategories().subscribe((response: any) => {
      this.categories = response.categories;
      this.statistics.challenges = this.categories.reduce((sum, cat) => sum + (cat.task_count || 0), 0);
    });

    this.animateStatistics();
  }

  animateStatistics() {
    const targets = {
      activePlayers: 1247,
      challenges: 0,
      countries: 42,
      guides: 156
    };

    Object.keys(targets).forEach(key => {
      const target = targets[key as keyof typeof targets];
      if (target > 0) {
        this.animateValue(key as keyof typeof this.statistics, 0, target, 2000);
      }
    });
  }

  animateValue(key: keyof typeof this.statistics, start: number, end: number, duration: number) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      this.statistics[key] = Math.floor(current);
    }, 16);
  }

  startCompeting() {
    this.router.navigate(['/register']);
  }

  viewChallenges() {
    this.router.navigate(['/categories']);
  }

  createAccount() {
    this.router.navigate(['/register']);
  }

  browseChallenges() {
    this.router.navigate(['/categories']);
  }

  navigateToCategory(categoryNicename: string) {
    this.router.navigate(['/category', categoryNicename]);
  }
}
