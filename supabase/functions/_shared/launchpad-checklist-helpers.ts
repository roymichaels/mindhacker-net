/**
 * SSOT: All launchpad-generated tasks now write to action_items.
 * Legacy aurora_checklists writes have been removed.
 */

export async function createWeekOneChecklists(supabase: any, userId: string, weekData: any) {
  if (!weekData?.tasks?.length) return;

  try {
    const items = weekData.tasks.map((task: string, index: number) => ({
      user_id: userId,
      type: 'task',
      source: 'system',
      status: 'todo',
      title: task,
      order_index: index,
      metadata: { origin: 'launchpad', week: 1, week_title: weekData?.title || 'Week 1' },
    }));
    await supabase.from('action_items').insert(items);
  } catch (error) {
    console.error('Error creating week 1 action items:', error);
  }
}

export async function createChecklistsFromActions(supabase: any, userId: string, actions: any) {
  if (!actions) return;

  try {
    const parsedActions = typeof actions === 'string' ? JSON.parse(actions) : actions;
    const items: any[] = [];
    let idx = 0;

    // Habits to quit → action_items type='habit'
    const habitsToQuit = parsedActions?.selectedQuit || parsedActions?.habits_to_quit || [];
    for (const habit of (Array.isArray(habitsToQuit) ? habitsToQuit.slice(0, 5) : [])) {
      items.push({
        user_id: userId, type: 'habit', source: 'system', status: 'todo',
        title: `🚫 ${String(habit)}`, order_index: idx++,
        metadata: { origin: 'launchpad', category: 'quit' },
      });
    }

    // Habits to build → action_items type='habit'
    const habitsToBuild = parsedActions?.selectedBuild || parsedActions?.habits_to_build || [];
    for (const habit of (Array.isArray(habitsToBuild) ? habitsToBuild.slice(0, 10) : [])) {
      items.push({
        user_id: userId, type: 'habit', source: 'system', status: 'todo',
        title: `🏗️ ${String(habit)}`, recurrence_rule: 'daily', order_index: idx++,
        metadata: { origin: 'launchpad', category: 'build' },
      });
    }

    // Career goals → action_items type='task'
    const careerGoal = parsedActions?.selectedCareerGoal || parsedActions?.career_goal;
    const nextSteps = parsedActions?.next_steps || [];
    if (careerGoal) {
      items.push({
        user_id: userId, type: 'task', source: 'system', status: 'todo',
        title: `💼 ${String(careerGoal)}`, order_index: idx++,
        metadata: { origin: 'launchpad', category: 'career' },
      });
    }
    if (Array.isArray(nextSteps)) {
      for (const step of nextSteps.slice(0, 4)) {
        items.push({
          user_id: userId, type: 'task', source: 'system', status: 'todo',
          title: String(step), order_index: idx++,
          metadata: { origin: 'launchpad', category: 'career' },
        });
      }
    }

    if (items.length > 0) {
      await supabase.from('action_items').insert(items);
    }

    console.log(`Created ${items.length} action_items from launchpad actions`);
  } catch (error) {
    console.error('Error creating action items from actions:', error);
  }
}
