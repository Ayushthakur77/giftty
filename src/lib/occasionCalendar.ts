export const occasionCalendar = [
  { name: "Valentine's Day", startMonth: 1, startDay: 1, endMonth: 2, endDay: 15 },
  { name: "Mother's Day", startMonth: 4, startDay: 15, endMonth: 5, endDay: 15 },
  { name: "Father's Day", startMonth: 5, startDay: 15, endMonth: 6, endDay: 20 },
  { name: "Raksha Bandhan", startMonth: 7, startDay: 1, endMonth: 8, endDay: 30 },
  { name: "Diwali", startMonth: 9, startDay: 15, endMonth: 11, endDay: 15 },
  { name: "Christmas", startMonth: 12, startDay: 1, endMonth: 12, endDay: 26 },
  { name: "New Year", startMonth: 12, startDay: 27, endMonth: 1, endDay: 10 },
];

export const evergreenOccasions = ["Birthday", "Anniversary", "Wedding"];

export function getUpcomingOccasion() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentDay = today.getDate();

  for (const occasion of occasionCalendar) {
    const isAfterStart = currentMonth > occasion.startMonth || (currentMonth === occasion.startMonth && currentDay >= occasion.startDay);
    const isBeforeEnd = currentMonth < occasion.endMonth || (currentMonth === occasion.endMonth && currentDay <= occasion.endDay);
    
    // Handle wrap-around year (e.g. New Year)
    if (occasion.startMonth > occasion.endMonth) {
      if (isAfterStart || isBeforeEnd) return occasion.name;
    } else {
      if (isAfterStart && isBeforeEnd) return occasion.name;
    }
  }

  // Fallback
  return evergreenOccasions[0];
}
