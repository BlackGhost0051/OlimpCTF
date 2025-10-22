import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Task} from '../../models/task';
import {FormsModule} from '@angular/forms';
import {ChallengeService} from '../../services/challenge/challenge.service';

@Component({
  selector: 'app-task-view',
  imports: [
    FormsModule
  ],
  templateUrl: './task-view.component.html',
  styleUrl: './task-view.component.scss'
})
export class TaskViewComponent{
  @Input() task!: Task;
  @Output() close = new EventEmitter<any>();

  showHints: boolean = false;
  flagInput= "";

  constructor(private challengeService: ChallengeService) {
  }

  verifyFlag(id: any){
    this.challengeService.verifyFlag(id, this.flagInput).subscribe({
      next: (response: any) => {
        if(response.status === true){
          alert("Correct flag!");
          // TODO: Refresh tasks it must add flag what was resolved

          // TODO: Return data with completed flag in main task request
        } else {
          alert(response.message);
        }
      },
      error: (error) => {
        alert("Error verifying flag");
      }
    });
  }

  onCloseClick(){
    this.close.emit();
  }
  noHintsClick(){
    this.showHints = !this.showHints;
  }
}
