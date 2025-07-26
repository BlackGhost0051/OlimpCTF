import {Component, Input} from '@angular/core';
import {Task} from '../../models/task';
import {FormsModule} from '@angular/forms';
import {ChallengeService} from '../../services/challenge/challenge.service';

@Component({
  selector: 'app-task',
  imports: [
    FormsModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent{
  @Input() task!: Task;

  flagInput= "";

  constructor(private challengeService: ChallengeService) {
  }

  verifyFlag(id: string){
    let result = this.challengeService.verifyFlag(id, this.flagInput);
  }
}
