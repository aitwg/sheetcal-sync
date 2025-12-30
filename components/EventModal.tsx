import React from 'react';
import { CalendarEvent } from '../types';
import { X, Calendar as CalIcon, MapPin, AlignLeft } from 'lucide-react';

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-semibold text-lg truncate pr-4">{event.title}</h3>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 text-slate-600">
            <CalIcon className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">
                {event.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {event.time && <p className="text-sm text-slate-500">{event.time}</p>}
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3 text-slate-600">
              <MapPin className="w-5 h-5 text-indigo-500 mt-0.5" />
              <p>{event.location}</p>
            </div>
          )}

          {event.description && (
            <div className="flex items-start gap-3 text-slate-600">
              <AlignLeft className="w-5 h-5 text-indigo-500 mt-0.5" />
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{event.description}</p>
            </div>
          )}

           {/* Debug Raw Data (Optional, for transparency) */}
           <div className="mt-6 pt-4 border-t border-slate-100">
             <details className="text-xs text-slate-400 cursor-pointer">
               <summary>View Raw Data</summary>
               <pre className="mt-2 p-2 bg-slate-50 rounded overflow-x-auto">
                 {JSON.stringify(event.raw, null, 2)}
               </pre>
             </details>
           </div>
        </div>

        <div className="p-4 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
