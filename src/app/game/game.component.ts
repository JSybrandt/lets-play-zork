import { Component, OnInit, AfterViewChecked, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';

import { interval, timer } from 'rxjs';
import { HistItem, histItemsEqual } from '../histitem';
import { GameService } from '../game.service';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatCard } from '@angular/material/card';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewChecked {
  command: string = "";
  history: HistItem[] = [];
  waiting: boolean = false;

  constructor(
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    this.gameService.get_history().subscribe(h => {
      this.maybeUpdateHistory(h);
    });
    interval(2000).subscribe(()=>{
      this.gameService.get_history().subscribe(h => this.maybeUpdateHistory(h));
    });
  }
  ngAfterViewChecked(): void {}

  submit(): void {
    if(!this.commandIsValid()) return;
    this.scrollToBottom();
    this.gameService.send_command(this.command).subscribe(h => {
      this.maybeUpdateHistory(h);
      this.waiting = false;
    });
    this.waiting = true;
    this.command = "";
  }

  commandIsValid(): boolean {
    return !this.waiting && this.command.length > 0 && this.command.length <= 200;
  }

  getCardClass(item: HistItem): string {
    if(item.command) return "command";
    if(item.prompt) return "prompt";
    if(item.error) return "error";
    return "error"
  }

  histItemToString(item: HistItem): string {
    if(item.command) return item.command;
    if(item.prompt) return item.prompt;
    if(item.error) return item.error;
    return "Invalid Item"
  }

  @ViewChild("viewport") private viewportContainer!: CdkVirtualScrollViewport;
  scrollToBottom(): void {
    this.viewportContainer.scrollTo({bottom: 0, behavior: "smooth"});
  }

  isCandidateDifferent(candidate:HistItem[]): boolean {
    if(this.history.length!==candidate.length) return true;
    return !this.history.every((h:HistItem, idx:number) => histItemsEqual(h, candidate[idx]));
  }

  maybeUpdateHistory(candidate: HistItem[]): void {
    if(!this.isCandidateDifferent(candidate)) return;
    this.history = candidate;
    this.scrollToBottom();
  }
}
