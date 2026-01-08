import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-dialog-window',
  imports: [],
  templateUrl: './dialog-window.component.html',
  styleUrl: './dialog-window.component.scss',
})
export class DialogWindowComponent {

  @Input() message: string = "";
  @Output() submit = new EventEmitter<any>;
  @Output() cancel = new EventEmitter<any>;

  dialogMode: 'info' | 'warning' = 'info';

  onSubmitToggled(): void{
    this.submit.emit();
  }
  onCancelToggled(): void{
    this.cancel.emit();
  }
}
