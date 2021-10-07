import {INoteControls} from './interfaces';
import {DbNote} from '../../db/note';

export class Note {
  private controls: INoteControls;
  private note: DbNote;
  private indexId: number;
  private event?: EventListener;
  public element: HTMLElement;

  constructor(note?: DbNote, index: number = 0) {
    this.note = note || this.createNew(index);
    this.indexId = index;

    this.init();
  }

  public init() {
    this.element = <HTMLElement>document.createElement('div');
    this.controls = {
      title: <HTMLElement>document.createElement('span'),
      bullet: <HTMLElement>document.createElement('span'),
      date: <HTMLElement>document.createElement('span'),
      sort: <HTMLInputElement>document.createElement('input'),
      toNote: <HTMLInputElement>document.createElement('input'),
    };
    
    this.element.className = 'list-item';
    this.controls.date.className = 'date-time';
    this.controls.title.className = 'list-title';
    this.controls.sort.className = 'button sort';

    this.controls.sort.type = 'button';
    this.controls.toNote.className = 'button to-note';

    this.controls.bullet.innerText = `${(this.indexId + 1)}`;
    this.controls.title.innerText = this.note.title;
    this.controls.date.innerText = this.getDateString(this.note.updated);

    this.element.appendChild(this.controls.toNote);
    this.element.appendChild(this.controls.sort);
    this.element.appendChild(this.controls.bullet);
    this.element.appendChild(document.createTextNode('. '));
    this.element.appendChild(this.controls.title);
    this.element.appendChild(this.controls.date);
  }

  public static saveQueue() {
    DbNote.saveQueue();
  }

  public set index(value: number) {
    if (this.indexId !== value) {
      this.indexId = value;
      this.note.order = value + 1;
      this.controls.bullet.innerText = `${(this.note.order)}`;
      this.note.setOrder();
    }
  }

  public get index(): number {
    return this.indexId;
  }

  public get title(): string {
    return this.note.title;
  }

  public set title(value: string) {
    if (this.note.title !== value) {
      this.note.title = value;
      this.note.updated = this.getTime();
      this.controls.title.innerText = this.note.title;
      this.controls.date.innerText = this.getDateString(this.note.updated);
    }
  }

  public get description(): string {
    return this.note.description;
  }

  public set description(value: string) {
    if (this.note.description !== value) {
      this.note.description = value;
      this.note.updated = this.getTime();
      this.controls.date.innerText = this.getDateString(this.note.updated);
    }
  }

  public get html(): string {
    return this.note.html;
  }

  public set html(value: string) {
    if (this.note.html !== value) {
      this.note.html = value;
      this.note.saveHtml();
    }
  }

  public get cursor(): string {
    return this.note.cState;
  }

  public set cursor(value: string) {
    if (this.note.cState !== value) {
      this.note.cState = value;
      this.note.saveCursor();
    }
  }

  public get previewState(): string {
    return this.note.pState;
  }

  public set previewState(value: string) {
    if (this.note.pState !== value) {
      this.note.pState = value;
      this.note.savePreviewState();
    }
  }

  public get preview(): boolean {
    return !!this.note.preview;
  }

  public set preview(value: boolean) {
    this.note.preview = value;
    this.note.setPreview();
  }

  public get sync(): boolean {
    return !!this.note.sync;
  }

  public set sync(value: boolean) {
    this.note.sync = value;
    this.note.setSync();
  }

  public set onclick(event: EventListener) {
    if (this.event) {
      this.element.removeEventListener('mousedown', this.prevent);
      this.element.removeEventListener('click', this.event);
    }

    this.event = event;
    this.element.addEventListener('mousedown', this.prevent);
    this.element.addEventListener('click', this.event);
  }

  public get sortButton(): HTMLInputElement {
    return this.controls.sort;
  }

  public save() {
    this.note.save();
  }

  public remove() {
    this.element.removeEventListener('mousedown', this.prevent);
    this.element.removeEventListener('click', this.event);
    this.element.remove();
    this.note.remove();
  }

  private createNew(index: number): DbNote {
    return new DbNote(0, '', '', index + 1, this.getTime(), this.getTime());
  }

  private prevent(e: MouseEvent) {
    e.preventDefault();
  }

  private getTime() {
    return new Date().getTime();
  }

  private getDateString(time: number) {
    return new Date(time).toDateString();
  }
}
