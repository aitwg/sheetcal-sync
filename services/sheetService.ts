import { CalendarEvent, SheetConfig } from '../types';

const DEFAULT_CONFIG: SheetConfig = {
  sheetId: '1Z_RZtqGpM2GdryfLiw6SOtJUZEYwO5iEx1RuFvN08-c',
  gid: '675741817'
};

/**
 * Parses a single CSV line handling quotes properly.
 */
const parseCSVLine = (text: string): string[] => {
  const result: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (i + 1 < text.length && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }
  result.push(cell);
  return result;
};

/**
 * Heuristic to identify column types based on header names.
 */
const identifyColumns = (headers: string[]) => {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  
  const dateIndex = lowerHeaders.findIndex(h => h.includes('date') || h.includes('time') || h.includes('day'));
  const titleIndex = lowerHeaders.findIndex(h => h.includes('event') || h.includes('title') || h.includes('subject') || h.includes('name') || h.includes('summary'));
  const descIndex = lowerHeaders.findIndex(h => h.includes('desc') || h.includes('detail') || h.includes('note'));
  const locIndex = lowerHeaders.findIndex(h => h.includes('loc') || h.includes('place') || h.includes('venue'));
  
  // Fallbacks
  return {
    date: dateIndex !== -1 ? dateIndex : 0, // Default to first column
    title: titleIndex !== -1 ? titleIndex : (dateIndex === 0 ? 1 : 0),
    description: descIndex,
    location: locIndex
  };
};

export const fetchSheetData = async (config: SheetConfig = DEFAULT_CONFIG): Promise<CalendarEvent[]> => {
  const url = `https://docs.google.com/spreadsheets/d/${config.sheetId}/export?format=csv&gid=${config.gid}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    
    const text = await response.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const colIndices = identifyColumns(headers);
    const events: CalendarEvent[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 2) continue; // Skip empty rows

      const dateStr = cols[colIndices.date]?.trim();
      if (!dateStr) continue;

      // Try parsing date
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue; // Invalid date

      const title = cols[colIndices.title]?.trim() || 'Untitled Event';
      const description = colIndices.description !== -1 ? cols[colIndices.description]?.trim() : '';
      const location = colIndices.location !== -1 ? cols[colIndices.location]?.trim() : '';

      events.push({
        id: `evt-${i}`,
        date,
        title,
        description,
        location,
        time: dateStr.includes(':') ? dateStr.split(' ')[1] : undefined, // Simple time extraction if present in date string
        raw: headers.reduce((acc, header, idx) => {
          acc[header] = cols[idx] || '';
          return acc;
        }, {} as Record<string, string>)
      });
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw error;
  }
};
