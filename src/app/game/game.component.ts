import { Component, OnInit } from '@angular/core';
import { HistItem } from '../histitem';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  command: string = "";
  history: HistItem[] = [];

  constructor(
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    this.gameService.get_history().subscribe(hist=>this.history=hist);
  }

  submit(): void {
    this.gameService.send_command(this.command).subscribe(hist=>this.history=hist);
    this.command = "";
  }

}
