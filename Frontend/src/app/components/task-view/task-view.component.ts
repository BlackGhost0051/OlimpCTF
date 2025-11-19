import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Task} from '../../models/task';
import {FormsModule} from '@angular/forms';
import {ChallengeService} from '../../services/challenge/challenge.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-task-view',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './task-view.component.html',
  styleUrl: './task-view.component.scss'
})
export class TaskViewComponent implements OnInit{
  @Input() task!: Task;
  @Output() close = new EventEmitter<any>();

  showHints: boolean = false;
  flagInput= "";

  containerUrl: string | null = null;
  containerStatus: string = 'not_found';
  containerLoading: boolean = false;
  expiresAt: Date | null = null;
  hasContainer: boolean = false;

  taskFiles: string[] = [];
  filesLoading: boolean = false;

  constructor(private challengeService: ChallengeService) {
  }

  ngOnInit() {
    this.checkTaskDetails();
  }

  checkTaskDetails(){
    if (!this.task.id){
      return;
    }

    this.filesLoading = true;


    this.challengeService.checkTaskDetails(this.task.id).subscribe({
      next: (response: any) =>{

        console.log("TASK DETAILS ", response);
        if (response.status && response.files) {
          this.taskFiles = response.files;
        }

        if(response.container !== false){
          this.hasContainer = true;
        }

        if (response.container !== true && response.container.status === 'running') {
          this.containerStatus = 'running';
          this.containerUrl = response.container.url;
          this.expiresAt = new Date(response.container.expires_at);
        } else {
          this.containerStatus = 'not_found';
        }

        this.containerLoading = false;
      },
      error: (error) => {
        this.containerLoading = false;
      }
    });
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

  startContainer() {
    if (!this.task.id) return;

    this.containerLoading = true;
    this.challengeService.startContainer(this.task.id).subscribe({
      next: (response: any) => {
        if (response.status && response.url) {
          this.containerUrl = response.url;
          this.containerStatus = 'running';
          this.expiresAt = new Date(response.expires_at);
        }
        this.containerLoading = false;
      },
      error: (error) => {
        alert("Error starting container: " + (error.error?.message || "Unknown error"));
        this.containerLoading = false;
      }
    });
  }

  stopContainer() {
    if (!this.task.id) return;

    this.containerLoading = true;
    this.challengeService.stopContainer(this.task.id).subscribe({
      next: (response: any) => {
        this.containerUrl = null;
        this.containerStatus = 'not_found';
        this.expiresAt = null;
        alert("Container stopped successfully");
        this.containerLoading = false;
      },
      error: (error) => {
        alert("Error stopping container: " + (error.error?.message || "Unknown error"));
        this.containerLoading = false;
      }
    });
  }

  downloadFile(filename: string) {
    if (!this.task.id) return;

    this.challengeService.downloadTaskFile(this.task.id, filename).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        alert("Error downloading file: " + (error.error?.message || "Unknown error"));
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
