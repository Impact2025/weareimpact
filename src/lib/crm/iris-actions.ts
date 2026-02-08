// Iris CRM Actions - Functions that Iris can execute for CRM operations
import { sql } from '@/lib/db/neon';
import { formatCurrency, dealStageLabels, taskPriorityLabels, getContactFullName } from './labels';

export interface CrmContext {
  pipelineSummary: string;
  overdueFollowups: string;
  todayTasks: string;
  recentWins: string;
}

// Get pipeline summary for Iris
export async function getPipelineSummary(): Promise<string> {
  try {
    const pipeline = await sql`
      SELECT
        stage,
        COUNT(*) as count,
        COALESCE(SUM(value), 0) as total_value
      FROM deals
      WHERE stage NOT IN ('won', 'lost')
      GROUP BY stage
      ORDER BY
        CASE stage
          WHEN 'lead' THEN 1
          WHEN 'qualified' THEN 2
          WHEN 'proposal' THEN 3
          WHEN 'negotiation' THEN 4
        END
    `;

    const total = await sql`
      SELECT
        COUNT(*) as count,
        COALESCE(SUM(value), 0) as total_value
      FROM deals
      WHERE stage NOT IN ('won', 'lost')
    `;

    if (Number(total[0]?.count || 0) === 0) {
      return 'Je hebt momenteel geen actieve deals in je pipeline.';
    }

    const totalValue = Number(total[0]?.total_value || 0);
    const dealCount = Number(total[0]?.count || 0);

    let summary = `Je pipeline bevat ${dealCount} actieve deal${dealCount !== 1 ? 's' : ''} met een totale waarde van ${formatCurrency(totalValue)}.\n\n`;

    for (const stage of pipeline) {
      const stageName = dealStageLabels[stage.stage as keyof typeof dealStageLabels] || stage.stage;
      const count = Number(stage.count);
      const value = Number(stage.total_value);
      summary += `- ${stageName}: ${count} deal${count !== 1 ? 's' : ''} (${formatCurrency(value)})\n`;
    }

    return summary;
  } catch (error) {
    console.error('Error getting pipeline summary:', error);
    return 'Ik kon de pipeline niet ophalen. Probeer het later opnieuw.';
  }
}

// Get overdue follow-ups
export async function getOverdueFollowups(): Promise<string> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const overdueTasks = await sql`
      SELECT
        t.title,
        t.due_date,
        t.priority,
        co.name as company_name,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
        d.title as deal_title
      FROM crm_tasks t
      LEFT JOIN companies co ON co.id = t.company_id
      LEFT JOIN contacts c ON c.id = t.contact_id
      LEFT JOIN deals d ON d.id = t.deal_id
      WHERE t.due_date < ${today}
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC, t.priority DESC
      LIMIT 10
    `;

    if (overdueTasks.length === 0) {
      return 'Je hebt geen achterstallige follow-ups. Goed bezig!';
    }

    let summary = `Je hebt ${overdueTasks.length} achterstallige follow-up${overdueTasks.length !== 1 ? 's' : ''}:\n\n`;

    for (const task of overdueTasks) {
      const dueDate = new Date(task.due_date as string);
      const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const entity = task.contact_name?.trim() ? task.contact_name : task.company_name || 'Onbekend';

      summary += `- **${entity}**: ${task.title} (${daysOverdue} dag${daysOverdue !== 1 ? 'en' : ''} over tijd)\n`;
    }

    return summary;
  } catch (error) {
    console.error('Error getting overdue followups:', error);
    return 'Ik kon de achterstallige follow-ups niet ophalen.';
  }
}

// Get today's tasks
export async function getTodayTasks(): Promise<string> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const tasks = await sql`
      SELECT
        t.title,
        t.priority,
        t.status,
        co.name as company_name,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
        d.title as deal_title
      FROM crm_tasks t
      LEFT JOIN companies co ON co.id = t.company_id
      LEFT JOIN contacts c ON c.id = t.contact_id
      LEFT JOIN deals d ON d.id = t.deal_id
      WHERE t.due_date = ${today}
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.priority DESC
      LIMIT 10
    `;

    if (tasks.length === 0) {
      return 'Je hebt vandaag geen taken gepland. Je dag is vrij!';
    }

    let summary = `Je hebt ${tasks.length} ta${tasks.length !== 1 ? 'ken' : 'ak'} voor vandaag:\n\n`;

    for (const task of tasks) {
      const priority = taskPriorityLabels[task.priority as keyof typeof taskPriorityLabels] || '';
      const entity = task.contact_name?.trim() || task.company_name || '';

      summary += `- ${task.title}`;
      if (entity) summary += ` (${entity})`;
      if (priority && task.priority !== 'normal') summary += ` [${priority}]`;
      summary += '\n';
    }

    return summary;
  } catch (error) {
    console.error('Error getting today tasks:', error);
    return 'Ik kon de taken voor vandaag niet ophalen.';
  }
}

// Get company info
export async function getCompanyInfo(companyName: string): Promise<string> {
  try {
    const companies = await sql`
      SELECT
        c.*,
        COUNT(DISTINCT co.id) as contact_count,
        COUNT(DISTINCT d.id) FILTER (WHERE d.stage NOT IN ('won', 'lost')) as active_deals,
        COALESCE(SUM(d.value) FILTER (WHERE d.stage NOT IN ('won', 'lost')), 0) as pipeline_value
      FROM companies c
      LEFT JOIN contacts co ON co.company_id = c.id
      LEFT JOIN deals d ON d.company_id = c.id
      WHERE c.name ILIKE ${'%' + companyName + '%'}
      GROUP BY c.id
      LIMIT 1
    `;

    if (companies.length === 0) {
      return `Ik kon geen bedrijf vinden met de naam "${companyName}".`;
    }

    const company = companies[0];

    let info = `**${company.name}**\n\n`;

    if (company.industry) info += `Sector: ${company.industry}\n`;
    if (company.city) info += `Locatie: ${company.city}\n`;
    if (company.email) info += `Email: ${company.email}\n`;
    if (company.phone) info += `Telefoon: ${company.phone}\n`;

    info += `\nContacten: ${company.contact_count || 0}\n`;
    info += `Actieve deals: ${company.active_deals || 0}\n`;

    if (Number(company.pipeline_value) > 0) {
      info += `Pipeline waarde: ${formatCurrency(Number(company.pipeline_value))}\n`;
    }

    if (company.notes) {
      info += `\nNotities: ${company.notes}\n`;
    }

    // Get recent activities
    const activities = await sql`
      SELECT type, subject, created_at
      FROM crm_activities
      WHERE company_id = ${company.id}
      ORDER BY created_at DESC
      LIMIT 3
    `;

    if (activities.length > 0) {
      info += '\nLaatste activiteiten:\n';
      for (const activity of activities) {
        const date = new Date(activity.created_at as string).toLocaleDateString('nl-NL');
        info += `- ${activity.subject} (${date})\n`;
      }
    }

    return info;
  } catch (error) {
    console.error('Error getting company info:', error);
    return 'Ik kon de bedrijfsinformatie niet ophalen.';
  }
}

// Add note to company
export async function addCompanyNote(companyName: string, note: string): Promise<string> {
  try {
    const companies = await sql`
      SELECT id, name FROM companies
      WHERE name ILIKE ${'%' + companyName + '%'}
      LIMIT 1
    `;

    if (companies.length === 0) {
      return `Ik kon geen bedrijf vinden met de naam "${companyName}".`;
    }

    const company = companies[0];

    await sql`
      INSERT INTO crm_activities (company_id, type, subject, description)
      VALUES (${company.id}, 'note', 'Notitie via Iris', ${note})
    `;

    return `Notitie toegevoegd bij ${company.name}.`;
  } catch (error) {
    console.error('Error adding company note:', error);
    return 'Ik kon de notitie niet toevoegen.';
  }
}

// Create follow-up task
export async function createFollowupTask(
  entityName: string,
  taskTitle: string,
  dueDate?: Date
): Promise<string> {
  try {
    // Try to find company or contact
    const companies = await sql`
      SELECT id, name FROM companies
      WHERE name ILIKE ${'%' + entityName + '%'}
      LIMIT 1
    `;

    let companyId = null;
    let contactId = null;
    let entityLabel = entityName;

    if (companies.length > 0) {
      companyId = companies[0].id;
      entityLabel = companies[0].name as string;
    } else {
      // Try contacts
      const contacts = await sql`
        SELECT id, first_name, last_name, company_id FROM contacts
        WHERE first_name ILIKE ${'%' + entityName + '%'}
          OR last_name ILIKE ${'%' + entityName + '%'}
        LIMIT 1
      `;

      if (contacts.length > 0) {
        contactId = contacts[0].id;
        companyId = contacts[0].company_id;
        entityLabel = getContactFullName(
          contacts[0].first_name as string,
          contacts[0].last_name as string | undefined
        );
      }
    }

    const dueDateStr = dueDate
      ? dueDate.toISOString().split('T')[0]
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await sql`
      INSERT INTO crm_tasks (company_id, contact_id, title, priority, due_date)
      VALUES (${companyId}, ${contactId}, ${taskTitle}, 'normal', ${dueDateStr})
    `;

    const dateFormatted = new Date(dueDateStr).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    if (companyId || contactId) {
      return `Taak aangemaakt voor ${entityLabel}: "${taskTitle}" - deadline ${dateFormatted}.`;
    } else {
      return `Taak aangemaakt: "${taskTitle}" - deadline ${dateFormatted}. (Ik kon geen bedrijf of contact vinden met "${entityName}")`;
    }
  } catch (error) {
    console.error('Error creating followup task:', error);
    return 'Ik kon de taak niet aanmaken.';
  }
}

// Morning briefing
export async function getMorningBriefing(): Promise<string> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get various stats
    const [taskStats, pipeline, recentWins, overdue] = await Promise.all([
      sql`
        SELECT
          COUNT(*) FILTER (WHERE due_date = ${today} AND status NOT IN ('completed', 'cancelled')) as today,
          COUNT(*) FILTER (WHERE due_date < ${today} AND status NOT IN ('completed', 'cancelled')) as overdue
        FROM crm_tasks
      `,
      sql`
        SELECT
          COUNT(*) as count,
          COALESCE(SUM(value), 0) as value
        FROM deals
        WHERE stage NOT IN ('won', 'lost')
      `,
      sql`
        SELECT title, value, updated_at
        FROM deals
        WHERE stage = 'won' AND updated_at >= ${weekAgo}
        ORDER BY updated_at DESC
        LIMIT 3
      `,
      sql`
        SELECT COUNT(*) as count
        FROM crm_tasks
        WHERE due_date < ${today} AND status NOT IN ('completed', 'cancelled')
      `,
    ]);

    const greeting = getGreeting();
    let briefing = `${greeting} Vincent! Hier is je briefing:\n\n`;

    // Today's tasks
    const tasksToday = Number(taskStats[0]?.today || 0);
    briefing += `**Vandaag**: ${tasksToday} ta${tasksToday !== 1 ? 'ken' : 'ak'} gepland\n`;

    // Overdue
    const overdueCount = Number(taskStats[0]?.overdue || 0);
    if (overdueCount > 0) {
      briefing += `**Achterstallig**: ${overdueCount} follow-up${overdueCount !== 1 ? 's' : ''} ⚠️\n`;
    }

    // Pipeline
    const dealCount = Number(pipeline[0]?.count || 0);
    const pipelineValue = Number(pipeline[0]?.value || 0);
    briefing += `**Pipeline**: ${formatCurrency(pipelineValue)} in ${dealCount} deal${dealCount !== 1 ? 's' : ''}\n`;

    // Recent wins
    if (recentWins.length > 0) {
      const winValue = recentWins.reduce((sum, w) => sum + Number(w.value || 0), 0);
      briefing += `**Deze week gewonnen**: ${recentWins.length} deal${recentWins.length !== 1 ? 's' : ''} (${formatCurrency(winValue)}) 🎉\n`;
    }

    // Action suggestions
    briefing += '\n';
    if (overdueCount > 0) {
      briefing += `Tip: Je hebt ${overdueCount} achterstallige items. Vraag "Welke klanten moet ik opvolgen?" voor details.\n`;
    } else if (tasksToday > 0) {
      briefing += `Tip: Focus vandaag op je ${tasksToday} geplande ta${tasksToday !== 1 ? 'ken' : 'ak'}.\n`;
    } else {
      briefing += `Tip: Je agenda is vrij vandaag. Tijd voor acquisitie of strategisch werk?\n`;
    }

    return briefing;
  } catch (error) {
    console.error('Error getting morning briefing:', error);
    return 'Ik kon je briefing niet samenstellen. Probeer het later opnieuw.';
  }
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 17) return 'Goedemiddag';
  return 'Goedenavond';
}

// Get CRM context for system prompt
export async function getCrmContext(): Promise<CrmContext> {
  const [pipelineSummary, overdueFollowups, todayTasks] = await Promise.all([
    getPipelineSummary(),
    getOverdueFollowups(),
    getTodayTasks(),
  ]);

  // Recent wins
  const recentWins = await sql`
    SELECT title, value
    FROM deals
    WHERE stage = 'won'
      AND updated_at >= NOW() - INTERVAL '7 days'
    ORDER BY updated_at DESC
    LIMIT 3
  `;

  let recentWinsText = '';
  if (recentWins.length > 0) {
    recentWinsText = recentWins
      .map((w) => `${w.title}: ${formatCurrency(Number(w.value))}`)
      .join(', ');
  }

  return {
    pipelineSummary,
    overdueFollowups,
    todayTasks,
    recentWins: recentWinsText,
  };
}
