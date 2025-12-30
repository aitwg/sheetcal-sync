export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  location?: string;
  time?: string;
  category?: string;
  raw: Record<string, string>;
}

export interface SheetConfig {
  sheetId: string;
  gid: string;
}

export enum ViewMode {
  Calendar = 'CALENDAR',
  List = 'LIST'
}
