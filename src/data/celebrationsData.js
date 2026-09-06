// Static data for the Celebrations module.
//
// Two halves:
//   1. The system calendar — national days, festivals and company-wide occasions
//      that repeat on their own. Nothing here is stored per employee; the module
//      reads it every time it draws the page, so adding a festival or a new year's
//      date is a one-line change in this file.
//   2. The window the module looks over when it derives celebrations
//      (birthdays and anniversaries come from employee records, not from here).
//
// Employee occasions themselves are deliberately absent: a birthday is read from
// the profile's date of birth and an anniversary from the employee's joining
// date, both calculated on the fly. Storing them would duplicate the directory
// and go stale the moment HR corrects a date.

// How far back and ahead the page reaches. Everything outside this window is not
// calculated at all, which keeps the card lists short without a pager. Both sides
// are one week: in a company of any size a wider horizon turns the bands into a
// wall of cards nobody reads, so the page shows what is happening this week.
export const CELEBRATION_PAST_DAYS = 7
export const CELEBRATION_FUTURE_DAYS = 7

// How far past the window an empty tab is allowed to look for its "next up"
// hint. The bands stay short; only the one-line answer to "when is the next
// one?" reaches out this far, and 90 days keeps a quarter's festivals in view.
export const CELEBRATION_LOOKAHEAD_DAYS = 90

// Days a new joiner is still introduced as one. Editable in Settings
// (settings.newJoinerWindowDays); this is the value a fresh store starts with.
export const DEFAULT_NEW_JOINER_WINDOW_DAYS = 7

// The celebration families. `group` splits people-derived occasions from the
// calendar ones, which is how the "Festivals & national days" tab filters.
export const CELEBRATION_KINDS = {
  birthday: { key: 'birthday', label: 'Birthday', group: 'people' },
  newJoiner: { key: 'newJoiner', label: 'New joiner', group: 'people' },
  anniversary: { key: 'anniversary', label: 'Work anniversary', group: 'people' },
  festival: { key: 'festival', label: 'Festival', group: 'calendar' },
  national: { key: 'national', label: 'National day', group: 'calendar' },
  occasion: { key: 'occasion', label: 'Company occasion', group: 'calendar' }
}

// Category values for the type filter dropdown in the management table.
export const CELEBRATION_EVENT_TYPES = [
  { key: 'festival', label: 'Festival' },
  { key: 'national', label: 'National day' },
  { key: 'occasion', label: 'Company occasion' }
]

// ---------------------------------------------------------------------------
// Part 1 of the system calendar: dates that fall on the same Gregorian date
// every year. `monthDay` is 'MM-DD'; the year is filled in at read time.
// ---------------------------------------------------------------------------
export const FIXED_DATE_CELEBRATIONS = [
  {
    id: 'new-year-day',
    name: 'New Year Day',
    kind: 'occasion',
    monthDay: '01-01',
    greeting: 'Happy New Year!',
    wish: 'Wishing everyone a healthy, happy and prosperous year ahead.'
  },
  {
    id: 'makar-sankranti',
    name: 'Makar Sankranti / Pongal',
    kind: 'festival',
    monthDay: '01-14',
    greeting: 'Happy Makar Sankranti!',
    wish: 'Wishing everyone a bright and joyful Pongal and Sankranti.'
  },
  {
    id: 'republic-day',
    name: 'Republic Day',
    kind: 'national',
    monthDay: '01-26',
    greeting: 'Happy Republic Day!',
    wish: 'Remembering the day our Constitution came into force, and the values behind it.'
  },
  {
    id: 'baisakhi',
    name: 'Baisakhi',
    kind: 'festival',
    monthDay: '04-13',
    greeting: 'Happy Baisakhi!',
    wish: 'Wishing everyone a joyful Baisakhi.'
  },
  {
    id: 'ambedkar-jayanti',
    name: 'Dr. B.R. Ambedkar Jayanti',
    kind: 'national',
    monthDay: '04-14',
    greeting: 'Remembering Dr. B.R. Ambedkar',
    wish: 'Saluting the architect of our Constitution on his birth anniversary.'
  },
  {
    id: 'independence-day',
    name: 'Independence Day',
    kind: 'national',
    monthDay: '08-15',
    greeting: 'Happy Independence Day!',
    wish: 'Wishing everyone a proud and memorable Independence Day.'
  },
  {
    id: 'gandhi-jayanti',
    name: 'Gandhi Jayanti',
    kind: 'national',
    monthDay: '10-02',
    greeting: 'Happy Gandhi Jayanti',
    wish: 'Remembering Mahatma Gandhi and his message of truth and non-violence.'
  },
  {
    id: 'christmas',
    name: 'Christmas',
    kind: 'festival',
    monthDay: '12-25',
    greeting: 'Merry Christmas!',
    wish: 'Wishing everyone a warm and happy Christmas with family and friends.'
  }
]

// ---------------------------------------------------------------------------
// Part 2: festivals whose date moves each year (luni-solar calendars), so each
// one carries an explicit date per year instead of a month/day pair.
//
// Dates follow the central government's gazetted holiday lists and the widely
// published panchang dates; moon-sighting festivals are officially tentative,
// so treat these as indicative. A year with no entry here is skipped by the
// module rather than guessed at — when HR knows the real date, either add it to
// the row below or enter it from Celebrations → Manage occasions as a company
// occasion, which takes effect for everyone immediately.
// ---------------------------------------------------------------------------
export const DATED_CELEBRATIONS = [
  {
    id: 'holi',
    name: 'Holi',
    kind: 'festival',
    dates: { '2025': '2025-03-14', '2026': '2026-03-04', '2027': '2027-03-22' },
    greeting: 'Happy Holi!',
    wish: 'Wishing everyone a colourful and joyful Holi.'
  },
  {
    id: 'eid-al-fitr',
    name: 'Eid al-Fitr',
    kind: 'festival',
    dates: { '2025': '2025-03-31', '2026': '2026-03-21', '2027': '2027-03-10' },
    greeting: 'Eid Mubarak!',
    wish: 'Wishing everyone a blessed Eid.'
  },
  {
    id: 'eid-al-adha',
    name: 'Eid al-Adha',
    kind: 'festival',
    dates: { '2025': '2025-06-07', '2026': '2026-05-27', '2027': '2027-05-17' },
    greeting: 'Eid Mubarak!',
    wish: 'Wishing everyone a blessed Eid al-Adha.'
  },
  {
    id: 'buddha-purnima',
    name: 'Buddha Purnima',
    kind: 'festival',
    dates: { '2025': '2025-05-12', '2026': '2026-05-01', '2027': '2027-05-20' },
    greeting: 'Happy Buddha Purnima',
    wish: 'Wishing everyone a peaceful Buddha Purnima.'
  },
  {
    id: 'raksha-bandhan',
    name: 'Raksha Bandhan',
    kind: 'festival',
    dates: { '2025': '2025-08-09', '2026': '2026-08-28', '2027': '2027-08-17' },
    greeting: 'Happy Raksha Bandhan!',
    wish: 'Wishing everyone a happy Raksha Bandhan with family.'
  },
  {
    id: 'janmashtami',
    name: 'Janmashtami',
    kind: 'festival',
    dates: { '2025': '2025-08-16', '2026': '2026-09-04', '2027': '2027-08-25' },
    greeting: 'Happy Janmashtami!',
    wish: 'Wishing everyone a joyful Janmashtami.'
  },
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    kind: 'festival',
    dates: { '2025': '2025-08-27', '2026': '2026-09-14', '2027': '2027-09-04' },
    greeting: 'Happy Ganesh Chaturthi!',
    wish: 'Wishing everyone an auspicious Ganesh Chaturthi.'
  },
  {
    id: 'dussehra',
    name: 'Dussehra',
    kind: 'festival',
    dates: { '2025': '2025-10-02', '2026': '2026-10-20', '2027': '2027-10-08' },
    greeting: 'Happy Dussehra!',
    wish: 'Wishing everyone a victorious and happy Dussehra.'
  },
  {
    id: 'diwali',
    name: 'Diwali',
    kind: 'festival',
    dates: { '2025': '2025-10-20', '2026': '2026-11-08', '2027': '2027-10-29' },
    greeting: 'Happy Diwali!',
    wish: 'Wishing everyone a happy, prosperous and safe Diwali.'
  },
  {
    id: 'guru-nanak-jayanti',
    name: 'Guru Nanak Jayanti',
    kind: 'festival',
    dates: { '2025': '2025-11-05', '2026': '2026-11-24', '2027': '2027-11-14' },
    greeting: 'Happy Guru Nanak Jayanti',
    wish: 'Remembering Guru Nanak Dev Ji and his message of service and equality.'
  }
]
