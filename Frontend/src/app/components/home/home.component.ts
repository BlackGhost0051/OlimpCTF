import {Component, OnInit} from '@angular/core';
import {FooterComponent} from '../global/footer/footer.component';
import {ChallengeService} from '../../services/challenge/challenge.service';


@Component({
  selector: 'app-home',
  imports: [FooterComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  categories: any;

  constructor(private challengeService: ChallengeService) {
  }

  ngOnInit() {
    this.challengeService.getCategories().subscribe((response: any) => {
      this.categories = response.categories;
      console.log(response.categories);
    });
  }

}
