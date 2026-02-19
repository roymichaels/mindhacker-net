import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCoachStorefront } from '@/contexts/PractitionerContext';
import { useCoachAuth } from '@/contexts/PractitionerAuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Menu, X, User, LogOut, BookOpen, Calendar, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const StorefrontHeader = () => {
  const { practitioner, settings, practitionerSlug } = useCoachStorefront();
  const { user, clientProfile, logout, isAuthenticated } = useCoachAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (!practitioner) return null;
  
  const baseUrl = `/p/${practitionerSlug}`;
  const brandColor = settings?.brand_color || '#e91e63';
  
  const navItems = [
    { label: t('courses'), href: `${baseUrl}/courses`, show: settings?.enable_courses !== false },
    { label: t('services'), href: `${baseUrl}/services`, show: settings?.enable_services !== false },
    { label: t('products'), href: `${baseUrl}/products`, show: settings?.enable_products !== false },
  ].filter(item => item.show);
  
  const handleLogout = async () => {
    await logout();
    navigate(baseUrl);
  };
  
  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to={baseUrl} className="flex items-center gap-3">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={practitioner.display_name} className="h-10 w-auto" />
          ) : (
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: brandColor }}>
              {practitioner.display_name.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-lg hidden sm:inline">{practitioner.display_name}</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={clientProfile?.avatar_url || user?.user_metadata?.avatar_url} alt={clientProfile?.display_name || ''} />
                    <AvatarFallback style={{ backgroundColor: brandColor, color: 'white' }}>
                      {(clientProfile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align={isRTL ? 'start' : 'end'}>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{clientProfile?.display_name || user?.email}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`${baseUrl}/dashboard`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />{t('dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`${baseUrl}/courses`} className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />{t('myCourses')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`${baseUrl}/messages`} className="cursor-pointer">
                    <MessageCircle className="mr-2 h-4 w-4" />{t('messages')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />{t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to={`${baseUrl}/login`}>{t('login')}</Link>
              </Button>
              <Button asChild style={{ backgroundColor: brandColor }}>
                <Link to={`${baseUrl}/signup`}>{t('signup')}</Link>
              </Button>
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default StorefrontHeader;
