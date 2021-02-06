import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  constructor() { }

  @Input() total: number;
  @Input() limit: number;
  @Output() pageEmit: EventEmitter<number> = new EventEmitter<number>();
  current: number = 0;

  pages: Array<number> = [];

  ngOnInit(): void {
    const end: number = Math.ceil(this.total/this.limit);
    for (let i = 0; i < end; i++) {
      this.pages.push(i + 1);
    }
  }

  start() {
    if (this.current === 0) return;
    this.current = 0;
    this.pageEmit.emit(this.current);
  }

  prev() {
    if (this.current === 0) return;
    this.current--;
    this.pageEmit.emit(this.current);
  }

  page(i: number) {
    this.current = i;
    this.pageEmit.emit(this.current);
  }

  next() {
    if (this.current === this.pages.length - 1) return;
    this.current++;
    this.pageEmit.emit(this.current);
  }

  end() {
    if (this.current === this.pages.length - 1) return;
    this.current = this.pages.length - 1;
    this.pageEmit.emit(this.current);
  }

}
