-- =============================================
-- COMMUNITY SYSTEM TABLES
-- =============================================

-- 1. Community Categories
CREATE TABLE public.community_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  icon TEXT DEFAULT 'MessageCircle',
  color TEXT DEFAULT '#6366f1',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Community Members (extends profiles)
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  current_level_id UUID,
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Community Levels (gamification)
CREATE TABLE public.community_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  min_points INTEGER NOT NULL DEFAULT 0,
  badge_icon TEXT DEFAULT 'Star',
  badge_color TEXT DEFAULT '#f59e0b',
  unlocks_content_ids UUID[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key for current_level_id after community_levels is created
ALTER TABLE public.community_members 
  ADD CONSTRAINT fk_community_members_level 
  FOREIGN KEY (current_level_id) REFERENCES public.community_levels(id) ON DELETE SET NULL;

-- 4. Community Posts
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.community_categories(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Community Comments
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Community Likes (for posts and comments)
CREATE TABLE public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT check_like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
  CONSTRAINT unique_comment_like UNIQUE (user_id, comment_id)
);

-- 7. Community Events
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  event_type TEXT DEFAULT 'live_session',
  meeting_url TEXT,
  cover_image_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attendees_count INTEGER DEFAULT 0,
  max_attendees INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Community Event RSVPs
CREATE TABLE public.community_event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_event_rsvp UNIQUE (event_id, user_id)
);

-- 9. Community Point Logs
CREATE TABLE public.community_point_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_category_id ON public.community_posts(category_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_posts_is_pinned ON public.community_posts(is_pinned) WHERE is_pinned = true;

CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX idx_community_comments_user_id ON public.community_comments(user_id);
CREATE INDEX idx_community_comments_parent_id ON public.community_comments(parent_comment_id);

CREATE INDEX idx_community_likes_post_id ON public.community_likes(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_community_likes_comment_id ON public.community_likes(comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX idx_community_likes_user_id ON public.community_likes(user_id);

CREATE INDEX idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX idx_community_members_points ON public.community_members(total_points DESC);

CREATE INDEX idx_community_events_start_time ON public.community_events(start_time);
CREATE INDEX idx_community_point_logs_user_id ON public.community_point_logs(user_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_point_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Community Categories Policies
CREATE POLICY "Anyone can view active categories" ON public.community_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.community_categories
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Members Policies
CREATE POLICY "Authenticated users can view members" ON public.community_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own member profile" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own member profile" ON public.community_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all members" ON public.community_members
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Levels Policies
CREATE POLICY "Anyone can view levels" ON public.community_levels
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage levels" ON public.community_levels
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Posts Policies
CREATE POLICY "Authenticated users can view posts" ON public.community_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts" ON public.community_posts
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Comments Policies
CREATE POLICY "Authenticated users can view comments" ON public.community_comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own comments" ON public.community_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.community_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" ON public.community_comments
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Likes Policies
CREATE POLICY "Authenticated users can view likes" ON public.community_likes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create likes" ON public.community_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own likes" ON public.community_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Community Events Policies
CREATE POLICY "Authenticated users can view published events" ON public.community_events
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage events" ON public.community_events
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Event RSVPs Policies
CREATE POLICY "Authenticated users can view RSVPs" ON public.community_event_rsvps
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create RSVPs" ON public.community_event_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own RSVPs" ON public.community_event_rsvps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVPs" ON public.community_event_rsvps
  FOR DELETE USING (auth.uid() = user_id);

-- Community Point Logs Policies
CREATE POLICY "Users can view own point logs" ON public.community_point_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all point logs" ON public.community_point_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert point logs" ON public.community_point_logs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_community_categories_updated_at
  BEFORE UPDATE ON public.community_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_members_updated_at
  BEFORE UPDATE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_levels_updated_at
  BEFORE UPDATE ON public.community_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INSERT DEFAULT CATEGORIES
-- =============================================
INSERT INTO public.community_categories (name, name_en, description, description_en, icon, color, order_index) VALUES
  ('דיונים', 'Discussions', 'דיונים כלליים בקהילה', 'General community discussions', 'MessageCircle', '#6366f1', 1),
  ('שאלות', 'Questions', 'שאלו את הקהילה', 'Ask the community', 'HelpCircle', '#22c55e', 2),
  ('הצלחות', 'Wins', 'שתפו את ההצלחות שלכם', 'Share your wins', 'Trophy', '#f59e0b', 3),
  ('הכרזות', 'Announcements', 'עדכונים חשובים', 'Important announcements', 'Megaphone', '#ef4444', 4);

-- =============================================
-- INSERT DEFAULT LEVELS
-- =============================================
INSERT INTO public.community_levels (name, name_en, min_points, badge_icon, badge_color, order_index) VALUES
  ('מתחיל', 'Newcomer', 0, 'Sprout', '#94a3b8', 1),
  ('פעיל', 'Active', 50, 'Flame', '#f97316', 2),
  ('תורם', 'Contributor', 200, 'Star', '#eab308', 3),
  ('מומחה', 'Expert', 500, 'Award', '#a855f7', 4),
  ('אלוף', 'Champion', 1000, 'Crown', '#3b82f6', 5),
  ('אגדה', 'Legend', 2500, 'Gem', '#ec4899', 6);

-- =============================================
-- FUNCTION: Update member stats
-- =============================================
CREATE OR REPLACE FUNCTION public.update_community_member_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'community_posts' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.community_members 
      SET posts_count = posts_count + 1, 
          total_points = total_points + 5,
          last_active_at = now()
      WHERE user_id = NEW.user_id;
      
      INSERT INTO public.community_point_logs (user_id, points, action_type, reference_id, reference_type, description)
      VALUES (NEW.user_id, 5, 'new_post', NEW.id, 'post', 'יצירת פוסט חדש');
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.community_members 
      SET posts_count = GREATEST(0, posts_count - 1)
      WHERE user_id = OLD.user_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'community_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.community_members 
      SET comments_count = comments_count + 1, 
          total_points = total_points + 2,
          last_active_at = now()
      WHERE user_id = NEW.user_id;
      
      INSERT INTO public.community_point_logs (user_id, points, action_type, reference_id, reference_type, description)
      VALUES (NEW.user_id, 2, 'new_comment', NEW.id, 'comment', 'הוספת תגובה');
      
      -- Update post comments count
      UPDATE public.community_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.community_members 
      SET comments_count = GREATEST(0, comments_count - 1)
      WHERE user_id = OLD.user_id;
      
      UPDATE public.community_posts 
      SET comments_count = GREATEST(0, comments_count - 1) 
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'community_likes' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.post_id IS NOT NULL THEN
        UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        
        -- Give point to post author
        UPDATE public.community_members cm
        SET likes_received = likes_received + 1, total_points = total_points + 1
        FROM public.community_posts cp
        WHERE cp.id = NEW.post_id AND cm.user_id = cp.user_id;
      ELSIF NEW.comment_id IS NOT NULL THEN
        UPDATE public.community_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        
        -- Give point to comment author
        UPDATE public.community_members cm
        SET likes_received = likes_received + 1, total_points = total_points + 1
        FROM public.community_comments cc
        WHERE cc.id = NEW.comment_id AND cm.user_id = cc.user_id;
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      IF OLD.post_id IS NOT NULL THEN
        UPDATE public.community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
        UPDATE public.community_members cm
        SET likes_received = GREATEST(0, likes_received - 1)
        FROM public.community_posts cp
        WHERE cp.id = OLD.post_id AND cm.user_id = cp.user_id;
      ELSIF OLD.comment_id IS NOT NULL THEN
        UPDATE public.community_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
        UPDATE public.community_members cm
        SET likes_received = GREATEST(0, likes_received - 1)
        FROM public.community_comments cc
        WHERE cc.id = OLD.comment_id AND cm.user_id = cc.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for stats updates
CREATE TRIGGER trigger_update_stats_on_post
  AFTER INSERT OR DELETE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_stats();

CREATE TRIGGER trigger_update_stats_on_comment
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_stats();

CREATE TRIGGER trigger_update_stats_on_like
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_stats();

-- =============================================
-- FUNCTION: Update member level based on points
-- =============================================
CREATE OR REPLACE FUNCTION public.update_community_member_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level_id UUID;
BEGIN
  SELECT id INTO new_level_id
  FROM public.community_levels
  WHERE min_points <= NEW.total_points
  ORDER BY min_points DESC
  LIMIT 1;
  
  IF new_level_id IS DISTINCT FROM NEW.current_level_id THEN
    NEW.current_level_id := new_level_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_member_level
  BEFORE UPDATE OF total_points ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_level();

-- =============================================
-- FUNCTION: Auto-create community member on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_community_member()
RETURNS TRIGGER AS $$
DECLARE
  starter_level_id UUID;
  profile_name TEXT;
BEGIN
  -- Get starter level
  SELECT id INTO starter_level_id FROM public.community_levels ORDER BY min_points ASC LIMIT 1;
  
  -- Get name from profiles if exists
  SELECT full_name INTO profile_name FROM public.profiles WHERE id = NEW.id;
  
  -- Insert community member
  INSERT INTO public.community_members (user_id, current_level_id)
  VALUES (NEW.id, starter_level_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users - but we need to use profiles instead
CREATE TRIGGER trigger_create_community_member
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_community_member();