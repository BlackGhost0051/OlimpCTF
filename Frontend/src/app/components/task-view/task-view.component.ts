import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Task} from '../../models/task';
import {FormsModule} from '@angular/forms';
import {ChallengeService} from '../../services/challenge/challenge.service';
import {CommonModule} from '@angular/common';
import {DialogWindowComponent} from '../dialog-window/dialog-window.component';

@Component({
  selector: 'app-task-view',
  imports: [
    FormsModule,
    CommonModule,
    DialogWindowComponent
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

  showDialog: boolean = false;
  dialogMessage: string = '';
  dialogMode: 'info' | 'warning' = 'info';
  dialogAction: (() => void) | null = null;

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

    if(!this.task.completed){
      this.challengeService.verifyFlag(id, this.flagInput).subscribe({
        next: (response: any) => {
          if(response.status === true){
            this.openDialog("Correct flag!", 'info', () => {
              // TODO: Return data with completed flag in main task request
              if(this.hasContainer){
                this.stopContainer();
              }
            });
          } else {
            this.openDialog(response.message, 'info');
          }
        },
        error: (error) => {
          this.openDialog("Error verifying flag", 'info');
        }
      });
    }
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
        this.openDialog("Error starting container: " + (error.error?.message || "Unknown error"), 'info');
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
        this.containerLoading = false;
      },
      error: (error) => {
        this.openDialog("Error stopping container: " + (error.error?.message || "Unknown error"), 'info');
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
        this.openDialog("Error downloading file: " + (error.error?.message || "Unknown error"), 'info');
      }
    });
  }

  onCloseClick(){
    // Don't close task view if dialog is open
    //  TODO: dont work need fix
    if (this.showDialog) {
      return;
    }
    this.close.emit();
  }
  noHintsClick(){
    this.showHints = !this.showHints;
  }

  // Dialog methods
  openDialog(message: string, mode: 'info' | 'warning' = 'info', action: (() => void) | null = null) {
    this.dialogMessage = message;
    this.dialogMode = mode;
    this.dialogAction = action;
    this.showDialog = true;
  }

  onDialogSubmit() {
    if (this.dialogAction) {
      this.dialogAction();
    }
    this.closeDialog();
  }

  onDialogCancel() {
    this.closeDialog();
  }

  closeDialog() {
    this.showDialog = false;
    this.dialogMessage = '';
    this.dialogAction = null;
  }
}
