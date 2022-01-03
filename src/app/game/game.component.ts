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
    this.gameService.get_history().subscribe(h => this.updateHistory(h));
    interval(3000).subscribe(()=>{
      this.gameService.get_history().subscribe(h => this.updateHistory(h));
    });
  }

  submit(): void {
    if(!this.commandIsValid()) return;
    this.gameService.send_command(this.command).subscribe(hist => {
      this.updateHistory(hist);
      this.waiting = false;
    });
    this.waiting = true;
    this.command = "";
  }

  @ViewChild('scrollBottom') private scrollBottom!: ElementRef;

  updateHistory(history:HistItem[]): void {
    this.history = history.slice(Math.max(history.length-7, 0))
    this.scrollToBottom();
  }

  commandIsValid(): boolean {
    return !this.waiting && this.command.length > 0 && this.command.length <= 200;
  }

  scrollToBottom(): void {
    this.scrollBottom.nativeElement.scrollTop = this.scrollBottom.nativeElement.scrollHeight;
  }

  getCardClass(item: HistItem): string {
    if(item.command) return "command";
    if(item.prompt) return "prompt";
    if(item.error) return "error";
    return "error"
  }

  toString(item: HistItem): string {
    if(item.command) return item.command;
    if(item.prompt) return item.prompt;
    if(item.error) return item.error;
    return "Invalid Item"
  }
}
