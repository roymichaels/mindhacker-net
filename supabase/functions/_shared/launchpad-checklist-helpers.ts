// Helper functions for creating checklists from launchpad data

export async function createWeekOneChecklists(supabase: any, userId: string, weekData: any) {
  if (!weekData?.tasks?.length) return;

  try {
    const weekTitle = weekData?.title || 'Week 1';
    const { data: checklist } = await supabase
      .from('aurora_checklists')
      .insert({
        user_id: userId,
        title: `📅 שבוע 1 - ${weekTitle}`,
        origin: 'launchpad',
        context: 'Auto-generated from 90-day transformation plan',
        status: 'active',
      })
      .select()
      .single();

    if (checklist) {
      const items = weekData.tasks.map((task: string, index: number) => ({
        checklist_id: checklist.id,
        content: task,
        order_index: index,
        is_completed: false,
      }));
      await supabase.from('aurora_checklist_items').insert(items);
    }
  } catch (error) {
    console.error('Error creating week 1 checklists:', error);
  }
}

export async function createChecklistsFromActions(supabase: any, userId: string, actions: any) {
  if (!actions) return;

  try {
    const parsedActions = typeof actions === 'string' ? JSON.parse(actions) : actions;
    
    // Habits to quit
    const habitsToQuit = parsedActions?.selectedQuit || parsedActions?.habits_to_quit || [];
    if (Array.isArray(habitsToQuit) && habitsToQuit.length > 0) {
      const { data: quitChecklist } = await supabase
        .from('aurora_checklists')
        .insert({ user_id: userId, title: '🚫 הרגלים להפסיק', origin: 'launchpad', status: 'active' })
        .select()
        .single();

      if (quitChecklist) {
        const items = habitsToQuit.slice(0, 5).map((habit: string, index: number) => ({
          checklist_id: quitChecklist.id,
          content: String(habit),
          order_index: index,
          is_completed: false,
        }));
        await supabase.from('aurora_checklist_items').insert(items);
      }
    }

    // Habits to build
    const habitsToBuild = parsedActions?.selectedBuild || parsedActions?.habits_to_build || [];
    if (Array.isArray(habitsToBuild) && habitsToBuild.length > 0) {
      const { data: buildChecklist } = await supabase
        .from('aurora_checklists')
        .insert({ user_id: userId, title: '🏗️ הרגלים לבנות', origin: 'launchpad', status: 'active' })
        .select()
        .single();

      if (buildChecklist) {
        const items = habitsToBuild.slice(0, 10).map((habit: string, index: number) => ({
          checklist_id: buildChecklist.id,
          content: String(habit),
          order_index: index,
          is_completed: false,
        }));
        await supabase.from('aurora_checklist_items').insert(items);
      }
    }

    // Career goals
    const careerGoal = parsedActions?.selectedCareerGoal || parsedActions?.career_goal;
    const nextSteps = parsedActions?.next_steps || [];
    if (careerGoal || (Array.isArray(nextSteps) && nextSteps.length > 0)) {
      const { data: careerChecklist } = await supabase
        .from('aurora_checklists')
        .insert({ user_id: userId, title: '💼 יעדי קריירה', origin: 'launchpad', status: 'active' })
        .select()
        .single();

      if (careerChecklist) {
        const items = [];
        if (careerGoal) {
          items.push({ checklist_id: careerChecklist.id, content: String(careerGoal), order_index: 0, is_completed: false });
        }
        if (Array.isArray(nextSteps)) {
          nextSteps.slice(0, 4).forEach((step: string, index: number) => {
            items.push({ checklist_id: careerChecklist.id, content: String(step), order_index: items.length, is_completed: false });
          });
        }
        if (items.length > 0) {
          await supabase.from('aurora_checklist_items').insert(items);
        }
      }
    }
    
    console.log('Created additional checklists from step 6 actions');
  } catch (error) {
    console.error('Error creating checklists from actions:', error);
  }
}
