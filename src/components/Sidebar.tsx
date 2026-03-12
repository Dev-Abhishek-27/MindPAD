import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  Star, 
  Tag, 
  Sparkles, 
  Settings, 
  Brain 
} from 'lucide-react';
import { cn } from '../lib/utils';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: FileText, label: 'My Notes', path: '/notes' },
  { icon: PlusCircle, label: 'Create Note', path: '/create' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#064e3b] text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
          <Brain className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">MindPad</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-emerald-500/20 text-emerald-400 font-semibold" 
                : "text-emerald-100/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
              "text-inherit"
            )} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
