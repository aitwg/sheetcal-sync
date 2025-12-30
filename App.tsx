import { useState, useEffect, useMemo } from 'react';
import { format, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, isToday } from 'date-fns';
import { Calendar as CalendarIcon, RefreshCw, ChevronLeft, ChevronRight, Search, AlertCircle } from 'lucide-react';
import { fetchSheetData } from './services/sheetService';
import { CalendarEvent, ViewMode } from './types';
import { EventModal } from './components/EventModal';

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.List);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSheetData();
      setEvents(data);
    } catch (err) {
      setError("Failed to sync with the spreadsheet. Please check your internet connection or the sheet permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const daysInMonth = useMemo(() => {
    // startOfMonth replacement
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const monthEvents = useMemo(() => {
    return filteredEvents.filter(e => isSameMonth(e.date, currentDate));
  }, [filteredEvents, currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  // subMonths replacement
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const jumpToToday = () => setCurrentDate(new Date());

  const eventsOnDay = (date: Date) => filteredEvents.filter(e => isSameDay(e.date, date));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
                SheetCal Sync
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search events..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 transition-all focus:w-64"
                />
              </div>

              <button 
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm p-1">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronLeft size={20}/></button>
              <button onClick={jumpToToday} className="px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded">Today</button>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronRight size={20}/></button>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button 
              onClick={() => setViewMode(ViewMode.Calendar)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.Calendar ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Calendar
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.List)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.List ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              List
            </button>
          </div>
        </div>

        {viewMode === ViewMode.Calendar ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
              {/* Padding for start of month */}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white min-h-[120px] lg:min-h-[160px] p-2 bg-slate-50/50"></div>
              ))}

              {daysInMonth.map(day => {
                const dayEvents = eventsOnDay(day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`bg-white min-h-[120px] lg:min-h-[160px] p-2 hover:bg-slate-50 transition-colors group relative ${isCurrentDay ? 'bg-indigo-50/30' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-xs text-slate-400 font-medium sm:hidden">{dayEvents.length}</span>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 overflow-y-auto max-h-[110px] custom-scrollbar">
                      {dayEvents.map(event => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="w-full text-left px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-300 transition-all truncate shadow-sm block"
                          title={event.title}
                        >
                          {event.time && <span className="opacity-75 mr-1 text-[10px]">{event.time}</span>}
                          {event.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {monthEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>No events found for this month.</p>
                </div>
              ) : (
                monthEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4 group"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                        {format(event.date, 'MMM')}
                      </div>
                      <div className="text-xl font-bold text-slate-800">
                        {format(event.date, 'd')}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-slate-500 truncate mt-0.5">
                        {event.time && <span className="mr-2 font-medium text-slate-600">{event.time}</span>}
                        {event.description || event.location || 'No additional details'}
                      </p>
                    </div>

                    <div className="text-slate-400 group-hover:text-indigo-400">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals & Panels */}
      <EventModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />

    </div>
  );
}

export default App;