import React, { useState } from 'react';
import { Menu, X, Lock, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import Logo from './Logo';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export default function Navbar({ currentPage, onNavigate, currentUser, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { title: 'The Pavilion', id: 'home' },
    { title: 'Aura Services', id: 'services' },
    { title: 'Royal Bridal', id: 'bridal' },
    { title: 'VIP Lounge Club', id: 'membership' },
    { title: 'Art Portfolio', id: 'gallery' },
    { title: 'Studio Coordinates', id: 'contact' },
  ];

  const handleNavItemClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm" id="header-navbar">
      {/* Container height increased to h-36 to accommodate the 144px logo without clipping */}
   <div className="max-w-[1600px] mx-auto px-6 h-36 flex items-center w-full">
        
        {/* Brand Logo – unchanged, still h-36 */}
        <button
  onClick={() => onNavigate('home')}
  className="flex items-center gap-2 group cursor-pointer text-left bg-transparent border-0 p-0 flex-shrink-0"
>
          <Logo 
            variant="horizontal" 
            size="custom" 
            customSizeClass="h-36"  // remains 144px
            className="hover:opacity-95 transition-opacity" 
          />
        </button>

        {/* Desktop Links – hidden on mobile */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-8 min-w-0">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                className={`text-sm uppercase tracking-widest transition-all cursor-pointer relative py-8 font-medium ${
                  isActive ? 'text-primary' : 'text-text hover:text-primary'
                }`}
              >
                {item.title}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-secondary animate-fade-in" />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic CTAs – hidden on mobile, shown on desktop */}
     <div className="hidden lg:flex items-center gap-4 ml-auto flex-shrink-0">
          
          {currentUser ? (
            <div className="flex items-center gap-3 border-r border-border pr-4 mr-2" id="nav-user-profile-badge">
              <div className="text-right">
                <div className="text-xs tracking-widest text-primary font-bold uppercase truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] tracking-wider text-text-secondary uppercase">
                {currentUser.isAdmin ? 'Administrator' : 'Royal Member'}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 border border-border hover:border-red-200 hover:text-red-600 text-text-secondary transition-colors cursor-pointer"
                title="Secure Logout"
                id="nav-logout-action-btn"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className={`px-6 py-2.5 bg-white border text-[11px] uppercase font-semibold tracking-widest transition-colors cursor-pointer flex items-center gap-2 ${
                currentPage === 'auth' 
                  ? 'border-secondary text-secondary' 
                  : 'border-secondary text-secondary hover:bg-secondary hover:text-white'
              }`}
              id="nav-login-trigger-btn"
            >
              VIP Entry
            </button>
          )}
          
          {currentUser?.isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-6 py-2.5 border rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                currentPage === 'admin' 
                  ? 'border-[#DDB93B] bg-[#DDB93B]/10 text-[#DDB93B]' 
                  : 'border-[#DDB93B]/40 text-primary hover:text-white hover:bg-[#DDB93B] hover:border-[#DDB93B]'
              }`}
              title="Administrative Console"
              id="nav-admin-portal-trigger"
            >
              <Lock className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden xl:inline">Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('appointment')}
            className="px-6 py-2.5 bg-primary text-white hover:bg-primary/90 transition-all text-[11px] font-semibold uppercase tracking-widest cursor-pointer rounded-md"
            id="nav-booking-cta"
          >
            Book Appointment
          </button>
        </div>

        {/* Mobile menu trigger – pushed to the right with ml-auto */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-text hover:text-primary cursor-pointer ml-auto"
          id="nav-mobile-hamburger"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer – unchanged */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-border animate-fade-in/90 block">
          <div className="p-6 space-y-4 flex flex-col items-stretch">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  className={`text-left text-sm uppercase tracking-widest font-medium py-3 border-b border-border transition-colors cursor-pointer ${
                    isActive ? 'text-primary' : 'text-text'
                  }`}
                >
                  {item.title}
                </button>
              );
            })}
            
            <div className="pt-4 flex flex-col gap-3">
              {!currentUser && (
                <button
                  onClick={() => handleNavItemClick('auth')}
                  className="py-3 px-4 bg-white border border-secondary text-center uppercase tracking-widest text-[11px] text-secondary font-semibold hover:bg-secondary hover:text-white cursor-pointer"
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => handleNavItemClick('appointment')}
                className="py-3 bg-primary text-white text-center uppercase tracking-widest text-[11px] font-semibold cursor-pointer rounded-md"
              >
                Book Appointment
              </button>

                 {currentUser?.isAdmin && (
                <button
                  onClick={() => handleNavItemClick('admin')}
                  className="py-3 px-4 bg-amber-50 border border-[#DDB93B]/40 text-center uppercase tracking-widest text-[11px] text-[#DDB93B] hover:bg-[#DDB93B] hover:text-white flex items-center justify-center gap-2 cursor-pointer rounded-md font-bold"
                >
                  <Lock className="h-3.5 w-3.5" /> Admin Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}