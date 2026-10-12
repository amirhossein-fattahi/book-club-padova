// Only confirmed arrangements belong here. Recruitment is independent of events.
export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type Genre = 'classic' | 'literary' | 'mystery' | 'scifi' | 'nonfiction' | 'poetry';
export interface BookGroup {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  facilitator: string;
  day: Weekday;
  time: string;
  firstMeetingDate: string;
  location: string;
  address: string;
  meetingLanguage: 'it' | 'en' | 'either';
  durationMinutes: number;
  cost: string;
  readingAssignment: string;
  totalSeats: number;
  confirmed: true;
  cover: [string, string];
}
// No facilitator or venue has agreed to a circle yet.
export const groups: BookGroup[] = [];
