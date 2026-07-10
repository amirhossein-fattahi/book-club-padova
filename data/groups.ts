// Simulated data for active reading circles.
// Swap this out for a real database / API later — the shape is all the UI needs.

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type Genre =
  | 'classic'
  | 'literary'
  | 'mystery'
  | 'scifi'
  | 'nonfiction'
  | 'poetry';

export interface BookGroup {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  facilitator: string;
  day: Weekday;
  /** 24h "HH:mm" — formatted by the UI. */
  time: string;
  /** Partner café name (kept language-neutral). */
  location: string;
  totalSeats: number;
  takenSeats: number;
  /** Two hex colors used to render a gradient book cover. */
  cover: [string, string];
}

export const groups: BookGroup[] = [
  {
    id: 'name-of-the-rose',
    title: 'The Name of the Rose',
    author: 'Umberto Eco',
    genre: 'mystery',
    facilitator: 'Marco Bianchi',
    day: 'tuesday',
    time: '18:30',
    location: 'Caffè Pedrocchi',
    totalSeats: 10,
    takenSeats: 6,
    cover: ['#5c3a29', '#a9714a']
  },
  {
    id: 'my-brilliant-friend',
    title: 'My Brilliant Friend',
    author: 'Elena Ferrante',
    genre: 'literary',
    facilitator: 'Giulia Rossi',
    day: 'thursday',
    time: '19:00',
    location: 'Bar Nazionale',
    totalSeats: 8,
    takenSeats: 5,
    cover: ['#284636', '#3f6b57']
  },
  {
    id: 'the-tartar-steppe',
    title: 'The Tartar Steppe',
    author: 'Dino Buzzati',
    genre: 'classic',
    facilitator: 'Alessandro Conti',
    day: 'monday',
    time: '18:00',
    location: 'Caffè Cavour',
    totalSeats: 10,
    takenSeats: 9,
    cover: ['#3b3a5a', '#6b6a95']
  },
  {
    id: 'invisible-cities',
    title: 'Invisible Cities',
    author: 'Italo Calvino',
    genre: 'literary',
    facilitator: 'Sofia Marchetti',
    day: 'wednesday',
    time: '20:00',
    location: 'Osteria dei Fabbri',
    totalSeats: 8,
    takenSeats: 8,
    cover: ['#7a3b52', '#c0708c']
  },
  {
    id: 'the-three-body-problem',
    title: 'The Three-Body Problem',
    author: 'Liu Cixin',
    genre: 'scifi',
    facilitator: 'Davide Greco',
    day: 'friday',
    time: '19:30',
    location: 'Caffè Diemme',
    totalSeats: 12,
    takenSeats: 7,
    cover: ['#1f3a4d', '#2f6f8f']
  },
  {
    id: 'if-this-is-a-man',
    title: 'If This Is a Man',
    author: 'Primo Levi',
    genre: 'nonfiction',
    facilitator: 'Chiara Ferrari',
    day: 'saturday',
    time: '17:00',
    location: 'Caffè Pedrocchi',
    totalSeats: 10,
    takenSeats: 4,
    cover: ['#4b3123', '#8f5a39']
  }
];
