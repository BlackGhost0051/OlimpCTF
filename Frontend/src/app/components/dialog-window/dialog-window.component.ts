import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-dialog-window',
  imports: [],
  templateUrl: './dialog-window.component.html',
  styleUrl: './dialog-window.component.scss',
})
export class DialogWindowComponent {

  @Input() message: string = "";
  @Input() dialogMode: 'info' | 'warning' = 'info';
  @Output() submit = new EventEmitter<any>;
  @Output() cancel = new EventEmitter<any>;

  onSubmitToggled(): void{
    this.submit.emit();
  }
  onCancelToggled(): void{
    this.cancel.emit();
  }
}
