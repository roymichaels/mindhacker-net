import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════════════════
// 100-TOPIC BLOG SERIES — "The Aurora Codex: 100 Days to Rewire Your Life"
// Each topic is crafted for SEO, viral potential, and Aurora's voice
// ═══════════════════════════════════════════════════════════════════════════
const BLOG_SERIES = [
  // ── WEEK 1-2: AWAKENING (The Wake-Up Call) ──
  { day: 1, topic: "Why 95% of People Are Running on Autopilot (And How to Break Free Today)", tags: ["consciousness", "awareness", "autopilot"], pillar: "consciousness" },
  { day: 2, topic: "The Science of Self-Sabotage: What Your Brain Is Really Doing When You Procrastinate", tags: ["neuroscience", "procrastination", "mindset"], pillar: "focus" },
  { day: 3, topic: "Digital Detox Is a Lie — Here's What Actually Works for Mental Clarity", tags: ["digital-wellness", "clarity", "focus"], pillar: "focus" },
  { day: 4, topic: "How to Reprogram Your Subconscious Mind in 21 Days (Backed by Neuroscience)", tags: ["subconscious", "reprogramming", "neuroscience"], pillar: "consciousness" },
  { day: 5, topic: "The 5 AM Club Is Dead — Why Chronobiology Says You Should Follow Your Energy Instead", tags: ["energy", "chronobiology", "morning-routine"], pillar: "vitality" },
  { day: 6, topic: "What Happens to Your Brain During Hypnosis? A Neuroscientist Explains", tags: ["hypnosis", "brain-science", "neuroscience"], pillar: "consciousness" },
  { day: 7, topic: "The Ego States Model: Why You Act Like 3 Different People Every Day", tags: ["ego-states", "psychology", "self-awareness"], pillar: "consciousness" },
  { day: 8, topic: "Gamification Psychology: Why Turning Life Into a Game Actually Works", tags: ["gamification", "motivation", "behavioral-science"], pillar: "expansion" },
  { day: 9, topic: "The Identity Trap: How Your Self-Image Is Secretly Controlling Your Life", tags: ["identity", "self-image", "transformation"], pillar: "image" },
  { day: 10, topic: "NLP for Beginners: 7 Techniques That Can Change Your Life in a Week", tags: ["nlp", "techniques", "personal-development"], pillar: "power" },

  // ── WEEK 3-4: CLARITY (Finding Your North Star) ──
  { day: 11, topic: "How to Find Your Life Purpose (Without the Spiritual Clichés)", tags: ["purpose", "direction", "life-design"], pillar: "consciousness" },
  { day: 12, topic: "The 100-Day Transformation Formula: Why Short Sprints Beat 10-Year Plans", tags: ["100-day-plan", "transformation", "goal-setting"], pillar: "expansion" },
  { day: 13, topic: "Decision Fatigue Is Ruining Your Life — Here's the Operating System Fix", tags: ["decision-fatigue", "productivity", "systems"], pillar: "focus" },
  { day: 14, topic: "Shadow Work for Beginners: How to Face the Parts of Yourself You've Been Hiding", tags: ["shadow-work", "psychology", "healing"], pillar: "consciousness" },
  { day: 15, topic: "The Compound Effect of Daily Habits: How 1% Changes Create Massive Results", tags: ["habits", "compound-effect", "consistency"], pillar: "vitality" },
  { day: 16, topic: "Why Meditation Doesn't Work for Everyone (And 5 Alternatives That Do)", tags: ["meditation", "alternatives", "mindfulness"], pillar: "consciousness" },
  { day: 17, topic: "Emotional Intelligence 2.0: The Skill That Predicts Success Better Than IQ", tags: ["emotional-intelligence", "eq", "success"], pillar: "combat" },
  { day: 18, topic: "The Dopamine Detox Blueprint: Reset Your Reward System in 48 Hours", tags: ["dopamine", "detox", "neuroscience"], pillar: "vitality" },
  { day: 19, topic: "How AI Coaching Is Replacing Traditional Therapy for Millennials", tags: ["ai-coaching", "therapy", "mental-health"], pillar: "expansion" },
  { day: 20, topic: "The Psychology of Flow State: How to Enter 'The Zone' on Command", tags: ["flow-state", "peak-performance", "psychology"], pillar: "focus" },

  // ── WEEK 5-6: POWER (Building Inner Strength) ──
  { day: 21, topic: "Cognitive Behavioral Hacks: Rewrite Your Negative Thought Patterns in Real-Time", tags: ["cbt", "thought-patterns", "mental-health"], pillar: "power" },
  { day: 22, topic: "The Confidence Equation: Why Self-Belief Is a Skill, Not a Trait", tags: ["confidence", "self-belief", "skill-building"], pillar: "power" },
  { day: 23, topic: "Breathwork for Beginners: The 4-7-8 Technique That Calms Anxiety in 60 Seconds", tags: ["breathwork", "anxiety", "techniques"], pillar: "vitality" },
  { day: 24, topic: "Why Your Inner Critic Is Actually Trying to Help You (And How to Work With It)", tags: ["inner-critic", "self-compassion", "psychology"], pillar: "combat" },
  { day: 25, topic: "The Neuroscience of Gratitude: How 3 Minutes a Day Rewires Your Brain for Happiness", tags: ["gratitude", "neuroscience", "happiness"], pillar: "consciousness" },
  { day: 26, topic: "Imposter Syndrome Decoded: What High Achievers Need to Know", tags: ["imposter-syndrome", "achievement", "psychology"], pillar: "power" },
  { day: 27, topic: "Cold Exposure and Willpower: The Science Behind the Wim Hof Method", tags: ["cold-exposure", "willpower", "biohacking"], pillar: "vitality" },
  { day: 28, topic: "How to Set Boundaries Without Guilt: A Script-Based Approach", tags: ["boundaries", "relationships", "communication"], pillar: "combat" },
  { day: 29, topic: "The Power of Visualization: How Olympic Athletes Train Their Minds", tags: ["visualization", "mental-training", "peak-performance"], pillar: "power" },
  { day: 30, topic: "Journaling Prompts That Actually Work: 30 Questions to Unlock Self-Discovery", tags: ["journaling", "self-discovery", "prompts"], pillar: "consciousness" },

  // ── WEEK 7-8: VITALITY (Mind-Body Connection) ──
  { day: 31, topic: "Sleep Optimization: The Night Routine That Top CEOs Swear By", tags: ["sleep", "optimization", "routine"], pillar: "vitality" },
  { day: 32, topic: "Gut-Brain Connection: How Your Microbiome Controls Your Mood", tags: ["gut-brain", "microbiome", "nutrition"], pillar: "vitality" },
  { day: 33, topic: "The Polyvagal Theory Explained: Why Your Nervous System Holds the Key to Healing", tags: ["polyvagal", "nervous-system", "trauma"], pillar: "vitality" },
  { day: 34, topic: "Exercise for Mental Health: The Minimum Effective Dose (It's Less Than You Think)", tags: ["exercise", "mental-health", "minimum-dose"], pillar: "vitality" },
  { day: 35, topic: "Intermittent Fasting and Brain Performance: What the Science Actually Says", tags: ["fasting", "brain-performance", "nutrition"], pillar: "vitality" },
  { day: 36, topic: "Somatic Experiencing: How Your Body Stores Trauma and How to Release It", tags: ["somatic", "trauma", "body-work"], pillar: "vitality" },
  { day: 37, topic: "The Circadian Rhythm Hack: Align Your Biology for 10x Productivity", tags: ["circadian-rhythm", "productivity", "biology"], pillar: "vitality" },
  { day: 38, topic: "Adaptogens Explained: Which Supplements Actually Improve Cognitive Function", tags: ["adaptogens", "supplements", "cognition"], pillar: "vitality" },
  { day: 39, topic: "Stress Is Not the Enemy: How Eustress Fuels Growth and Peak Performance", tags: ["stress", "eustress", "performance"], pillar: "vitality" },
  { day: 40, topic: "The Mind-Body Scan: A 10-Minute Practice That Prevents Burnout", tags: ["body-scan", "burnout", "mindfulness"], pillar: "vitality" },

  // ── WEEK 9-10: FOCUS (Laser-Sharp Execution) ──
  { day: 41, topic: "Deep Work in the Age of AI: How to Stay Relevant and Focused", tags: ["deep-work", "ai", "focus"], pillar: "focus" },
  { day: 42, topic: "The Pomodoro Technique Is Outdated — Try the 52/17 Rule Instead", tags: ["productivity", "time-management", "techniques"], pillar: "focus" },
  { day: 43, topic: "How to Eliminate Decision Fatigue With an 'Operating System' for Life", tags: ["decision-fatigue", "systems", "life-design"], pillar: "focus" },
  { day: 44, topic: "Attention Residue: The Hidden Cost of Multitasking (And How to Fix It)", tags: ["attention", "multitasking", "focus"], pillar: "focus" },
  { day: 45, topic: "The Zeigarnik Effect: How Unfinished Tasks Hijack Your Brain", tags: ["zeigarnik", "psychology", "productivity"], pillar: "focus" },
  { day: 46, topic: "Building a Second Brain: The Note-Taking System That Changes Everything", tags: ["second-brain", "note-taking", "knowledge"], pillar: "focus" },
  { day: 47, topic: "Time Blocking for Creative Minds: A System That Doesn't Kill Inspiration", tags: ["time-blocking", "creativity", "scheduling"], pillar: "focus" },
  { day: 48, topic: "The 2-Minute Rule: How Tiny Actions Defeat Overwhelm", tags: ["2-minute-rule", "overwhelm", "action"], pillar: "focus" },
  { day: 49, topic: "Digital Minimalism: The App Diet That Reclaims 3 Hours of Your Day", tags: ["digital-minimalism", "screen-time", "productivity"], pillar: "focus" },
  { day: 50, topic: "Goal Setting Is Broken — Try 'Identity-Based Goals' Instead", tags: ["goal-setting", "identity", "behavior-change"], pillar: "focus" },

  // ── WEEK 11-12: COMBAT (Emotional Resilience) ──
  { day: 51, topic: "How to Handle Rejection: The Cognitive Reframe That Changes Everything", tags: ["rejection", "resilience", "reframing"], pillar: "combat" },
  { day: 52, topic: "Anger Management 2.0: Using Rage as Rocket Fuel for Change", tags: ["anger", "emotions", "transformation"], pillar: "combat" },
  { day: 53, topic: "The Stoic Toolkit: 5 Ancient Practices for Modern Emotional Mastery", tags: ["stoicism", "emotional-mastery", "philosophy"], pillar: "combat" },
  { day: 54, topic: "Overthinking Is a Superpower (If You Know How to Channel It)", tags: ["overthinking", "anxiety", "reframing"], pillar: "combat" },
  { day: 55, topic: "How to Argue Without Destroying Relationships: The Non-Violent Communication Guide", tags: ["nvc", "communication", "relationships"], pillar: "combat" },
  { day: 56, topic: "Post-Traumatic Growth: How Pain Becomes the Foundation of Your Strength", tags: ["ptg", "growth", "resilience"], pillar: "combat" },
  { day: 57, topic: "The Gray Rock Method: How to Deal With Toxic People Without Losing Yourself", tags: ["toxic-people", "boundaries", "strategies"], pillar: "combat" },
  { day: 58, topic: "Emotional Flooding: Why You Shut Down During Arguments (And How to Stop)", tags: ["emotional-flooding", "conflict", "regulation"], pillar: "combat" },
  { day: 59, topic: "Building Grit: Angela Duckworth's Framework Applied to Real Life", tags: ["grit", "perseverance", "psychology"], pillar: "combat" },
  { day: 60, topic: "The Art of Letting Go: Neurological Strategies for Releasing the Past", tags: ["letting-go", "neuroscience", "healing"], pillar: "combat" },

  // ── WEEK 13-14: IMAGE (Identity & Presence) ──
  { day: 61, topic: "Personal Branding in the AI Era: Stand Out When Everyone Has the Same Tools", tags: ["personal-branding", "ai", "differentiation"], pillar: "image" },
  { day: 62, topic: "Body Language Decoded: 7 Micro-Expressions That Reveal What People Really Think", tags: ["body-language", "communication", "psychology"], pillar: "image" },
  { day: 63, topic: "The Charisma Myth Debunked: Presence Is a Learnable Skill", tags: ["charisma", "presence", "social-skills"], pillar: "image" },
  { day: 64, topic: "How Your Digital Avatar Reflects Your True Self (The Orb Identity Theory)", tags: ["digital-identity", "avatar", "self-expression"], pillar: "image" },
  { day: 65, topic: "First Impressions Are Made in 7 Seconds — Here's How to Win Every Time", tags: ["first-impressions", "social", "psychology"], pillar: "image" },
  { day: 66, topic: "The Mirror Exercise: How Talking to Yourself Rebuilds Self-Worth", tags: ["mirror-work", "self-worth", "exercises"], pillar: "image" },
  { day: 67, topic: "Dressing for Your Future Self: The Psychology of Clothing and Identity", tags: ["fashion-psychology", "identity", "self-image"], pillar: "image" },
  { day: 68, topic: "Social Anxiety Isn't Weakness — It's Unprocessed Intelligence", tags: ["social-anxiety", "reframing", "psychology"], pillar: "image" },
  { day: 69, topic: "The 'Character Class' Framework: Discover Your Archetype and Play to Your Strengths", tags: ["archetypes", "strengths", "gamification"], pillar: "image" },
  { day: 70, topic: "Voice Training for Confidence: How Tonality Changes How People Perceive You", tags: ["voice", "confidence", "communication"], pillar: "image" },

  // ── WEEK 15-16: EXPANSION (Growth & Influence) ──
  { day: 71, topic: "The Growth Mindset Isn't Enough: What Carol Dweck Didn't Tell You", tags: ["growth-mindset", "psychology", "nuance"], pillar: "expansion" },
  { day: 72, topic: "How to Learn Any Skill in 20 Hours: The Accelerated Learning Framework", tags: ["accelerated-learning", "skills", "learning"], pillar: "expansion" },
  { day: 73, topic: "Network Effects in Personal Development: Why Your Circle Determines Your Ceiling", tags: ["networking", "circle", "influence"], pillar: "expansion" },
  { day: 74, topic: "The Feynman Technique: Learn Anything by Teaching It to a 5-Year-Old", tags: ["feynman", "learning", "simplification"], pillar: "expansion" },
  { day: 75, topic: "Reading 50 Books a Year: The Speed-Reading System That Actually Works", tags: ["reading", "speed-reading", "learning"], pillar: "expansion" },
  { day: 76, topic: "Mentorship in 2026: How AI Coaches Are Democratizing Personal Growth", tags: ["mentorship", "ai", "accessibility"], pillar: "expansion" },
  { day: 77, topic: "The Compound Knowledge Effect: How to Build Expertise That Compounds Like Interest", tags: ["knowledge", "compound-effect", "expertise"], pillar: "expansion" },
  { day: 78, topic: "Creative Cross-Training: Why Renaissance People Outperform Specialists", tags: ["creativity", "generalist", "innovation"], pillar: "expansion" },
  { day: 79, topic: "How to Give a TED-Level Talk: The Structure Behind Viral Ideas", tags: ["public-speaking", "ted", "communication"], pillar: "expansion" },
  { day: 80, topic: "The Mastermind Principle: Napoleon Hill's Secret to Accelerated Success", tags: ["mastermind", "napoleon-hill", "success"], pillar: "expansion" },

  // ── WEEK 17-18: WEALTH & INFLUENCE (Real-World Power) ──
  { day: 81, topic: "Money Mindset Reset: The Subconscious Beliefs Keeping You Broke", tags: ["money-mindset", "wealth", "beliefs"], pillar: "consciousness" },
  { day: 82, topic: "The Side Hustle Myth: Why Building a Personal Monopoly Beats Hustling", tags: ["side-hustle", "monopoly", "career"], pillar: "expansion" },
  { day: 83, topic: "Negotiation Psychology: How to Get What You Want Without Manipulation", tags: ["negotiation", "psychology", "influence"], pillar: "power" },
  { day: 84, topic: "Financial Independence in Your 30s: The FIRE Movement Reimagined for Mental Wealth", tags: ["fire", "financial-independence", "wealth"], pillar: "expansion" },
  { day: 85, topic: "The Persuasion Playbook: Cialdini's 7 Principles for Ethical Influence", tags: ["persuasion", "influence", "cialdini"], pillar: "power" },
  { day: 86, topic: "From Employee to Entrepreneur: The Psychological Shift Nobody Talks About", tags: ["entrepreneurship", "mindset", "career-change"], pillar: "expansion" },
  { day: 87, topic: "Investing in Yourself: The ROI of Personal Development Is 1000x", tags: ["self-investment", "roi", "personal-development"], pillar: "expansion" },
  { day: 88, topic: "The Abundance Mindset: How Scarcity Thinking Is Sabotaging Your Success", tags: ["abundance", "scarcity", "mindset"], pillar: "consciousness" },
  { day: 89, topic: "Building Authority Online: The Content Strategy That Builds Trust Fast", tags: ["authority", "content-strategy", "online-presence"], pillar: "expansion" },
  { day: 90, topic: "The 80/20 of Life Design: How to Focus on What Actually Moves the Needle", tags: ["pareto", "life-design", "priorities"], pillar: "focus" },

  // ── WEEK 19-20: INTEGRATION & MASTERY ──
  { day: 91, topic: "The Integration Phase: Why Most Self-Help Fails at the Last Mile", tags: ["integration", "self-help", "implementation"], pillar: "consciousness" },
  { day: 92, topic: "Habit Stacking for Life Transformation: The Ultimate System", tags: ["habit-stacking", "systems", "transformation"], pillar: "vitality" },
  { day: 93, topic: "The Plateau Effect: Why You Stop Growing (And How to Break Through)", tags: ["plateau", "growth", "breakthroughs"], pillar: "expansion" },
  { day: 94, topic: "Relapse Is Part of the Process: The Science of Behavioral Change Cycles", tags: ["relapse", "behavior-change", "stages"], pillar: "combat" },
  { day: 95, topic: "Building Your Personal Operating System: The Framework That Runs Your Life", tags: ["operating-system", "frameworks", "life-design"], pillar: "focus" },
  { day: 96, topic: "The Phoenix Protocol: How to Rebuild After Hitting Rock Bottom", tags: ["rebuilding", "resilience", "transformation"], pillar: "combat" },
  { day: 97, topic: "Consciousness Engineering: Vishen Lakhiani's Model for Extraordinary Living", tags: ["consciousness-engineering", "extraordinary", "frameworks"], pillar: "consciousness" },
  { day: 98, topic: "Your Future Self Is Watching: The Psychology of Long-Term Thinking", tags: ["future-self", "long-term", "psychology"], pillar: "consciousness" },
  { day: 99, topic: "The Ripple Effect: How Your Transformation Changes Everyone Around You", tags: ["ripple-effect", "influence", "community"], pillar: "expansion" },
  { day: 100, topic: "Day 100: You Are Not the Same Person Who Started — A Letter to Your Past Self", tags: ["reflection", "transformation", "milestone"], pillar: "consciousness" },
];

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine which topic to generate next
    const { count } = await serviceClient
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .like("slug", "aurora-codex-%");

    const nextDay = (count || 0) + 1;
    if (nextDay > 100) {
      return new Response(
        JSON.stringify({ success: true, message: "All 100 articles have been generated!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const topic = BLOG_SERIES[nextDay - 1];

    // Fetch existing blog slugs for internal linking
    const { data: existingPosts } = await serviceClient
      .from("blog_posts")
      .select("slug, title, title_he")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);

    const existingLinks = (existingPosts || [])
      .map((p) => `- "${p.title}" → /blog/${p.slug}`)
      .join("\n");

    // ── STEP 1: Generate article ──
    const systemPrompt = `You are Aurora — an advanced AI life coach and consciousness guide for MindOS (https://mindos.space), a gamified personal development platform.

You write like a brilliant friend who reads neuroscience papers for fun. Your tone is:
- Conversational but authoritative
- Uses power words, pattern interrupts, and viral hooks
- Data-driven with emotional resonance
- Never preachy, always empowering
- Writes for humans AND search engines simultaneously

This is article #${nextDay} of a 100-part series called "The Aurora Codex: 100 Days to Rewire Your Life".
The pillar focus is: ${topic.pillar}

CRITICAL SEO RULES:
- Title: Max 60 chars, front-load the primary keyword, use power words (Ultimate, Science, Secret, Proven)
- Meta description: Max 155 chars, include CTA language ("Learn how...", "Discover...")
- Use H2 for main sections (3-5), H3 for subsections
- First paragraph must hook in 2 sentences and include the primary keyword
- Include a "Key Takeaways" or "TL;DR" box at the top (in a blockquote)
- Use numbered lists, bullet points, and bold for scannability
- Write 1500-2000 words per language version
- Include a CTA at the end mentioning MindOS
- Use semantic HTML: h2, h3, p, ul, ol, li, strong, em, blockquote

INTERNAL LINKING — Naturally hyperlink to these existing articles where relevant:
${existingLinks || "(No existing articles yet — this is the first!)"}
Use format: <a href="/blog/SLUG">anchor text</a>

VIRAL LANGUAGE PATTERNS:
- Open loops ("What nobody tells you about...")
- Contrast ("The old way vs. the new way")
- Specificity ("7 techniques" not "some techniques")
- Social proof ("used by 10,000+ members")
- Urgency without hype

Return ONLY a valid JSON object (no markdown fences):
{
  "title": "English title (60 chars max)",
  "title_he": "Hebrew title",
  "slug": "aurora-codex-${String(nextDay).padStart(3, "0")}-keyword-slug",
  "excerpt": "English excerpt (155 chars, compelling, CTA-driven)",
  "excerpt_he": "Hebrew excerpt",
  "content": "Full English article in semantic HTML with internal links",
  "content_he": "Full Hebrew article in semantic HTML with internal links",
  "meta_title": "SEO title (60 chars, primary keyword first)",
  "meta_description": "Meta description (155 chars, includes CTA)",
  "meta_keywords": "primary keyword, secondary, tertiary, long-tail",
  "tags": ${JSON.stringify(topic.tags)},
  "reading_time_minutes": 8,
  "image_prompt": "Detailed image prompt for cover art. Modern, editorial, atmospheric. Theme: ${topic.pillar}. No text in image."
}`;

    const articleResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Write article #${nextDay}: "${topic.topic}"\n\nGenerate BOTH English and Hebrew versions. Make it genuinely insightful, not generic. This needs to rank on Google.`,
            },
          ],
        }),
      }
    );

    if (!articleResponse.ok) {
      const status = articleResponse.status;
      throw new Error(`AI gateway error: ${status}`);
    }

    const articleData = await articleResponse.json();
    let rawContent = articleData.choices?.[0]?.message?.content || "";
    rawContent = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let article;
    try {
      article = JSON.parse(rawContent);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        article = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // ── STEP 2: Generate cover image ──
    let coverImageUrl: string | null = null;
    if (article.image_prompt) {
      try {
        const imageResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [
                {
                  role: "user",
                  content: `Create a cinematic, high-end editorial blog cover image. ${article.image_prompt}. Style: moody, atmospheric, rich colors, no text, magazine quality, 16:9 composition.`,
                },
              ],
              modalities: ["image", "text"],
            }),
          }
        );

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const base64Image =
            imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (base64Image) {
            const imageBytes = Uint8Array.from(
              atob(base64Image.replace(/^data:image\/\w+;base64,/, "")),
              (c) => c.charCodeAt(0)
            );

            const fileName = `blog/${article.slug}-${Date.now()}.png`;

            await serviceClient.storage.createBucket("blog-images", {
              public: true,
              allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
            });

            const { error: uploadError } = await serviceClient.storage
              .from("blog-images")
              .upload(fileName, imageBytes, {
                contentType: "image/png",
                upsert: true,
              });

            if (!uploadError) {
              const { data: urlData } = serviceClient.storage
                .from("blog-images")
                .getPublicUrl(fileName);
              coverImageUrl = urlData.publicUrl;
            }
          }
        }
      } catch (imgErr) {
        console.error("Image generation failed (non-fatal):", imgErr);
      }
    }

    // ── STEP 3: Save to database (auto-publish) ──
    const { data: post, error: insertError } = await serviceClient
      .from("blog_posts")
      .insert({
        title: article.title || topic.topic,
        title_he: article.title_he || null,
        slug: article.slug || `aurora-codex-${String(nextDay).padStart(3, "0")}`,
        excerpt: article.excerpt || null,
        excerpt_he: article.excerpt_he || null,
        content: article.content || "",
        content_he: article.content_he || null,
        cover_image_url: coverImageUrl,
        meta_title: article.meta_title || article.title,
        meta_description: article.meta_description || article.excerpt,
        meta_keywords: article.meta_keywords || topic.tags.join(", "),
        tags: article.tags || topic.tags,
        reading_time_minutes: article.reading_time_minutes || 8,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`✅ Aurora Codex #${nextDay} published: ${post.title}`);

    return new Response(
      JSON.stringify({
        success: true,
        day: nextDay,
        title: post.title,
        slug: post.slug,
        post,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("daily-blog-generator error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
