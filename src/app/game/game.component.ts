import { Component, OnInit } from '@angular/core';
import { interval} from 'rxjs';
import { HistItem } from '../histitem';
import { GameService } from '../game.service';
import { AfterViewChecked, ElementRef, ViewChild} from '@angular/core'


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  command: string = "";
  history: HistItem[] = [];
  waiting: boolean = false;

  constructor(
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    this.updateHistory();
    interval(2000).subscribe(()=>this.updateHistory());
  }

  submit(): void {
    if(!this.commandIsValid()) return;
    this.gameService.send_command(this.command).subscribe(hist=>{
      this.history=hist.slice(Math.max(hist.length-7, 0));
      this.waiting=false;
    });
    this.waiting = true;
    this.command = "";
  }

  @ViewChild('scrollBottom') private scrollBottom!: ElementRef;

  updateHistory(): void {
    this.gameService.get_history().subscribe(hist=>this.history=hist.slice(Math.max(hist.length-7, 0)));
    this.scrollToBottom();
  }

  commandIsValid(): boolean {
    return !this.waiting && this.command.length > 0;
  }

  scrollToBottom(): void {
    this.scrollBottom.nativeElement.scrollTop = this.scrollBottom.nativeElement.scrollHeight;
  }

}
