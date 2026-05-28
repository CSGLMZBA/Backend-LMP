import * as teamsService from '../teams/teams.service.js';
import * as projectsRepository from '../projects/projects.repository.js';
import * as tasksRepository from '../Task/task.repository.js';

const EMPTY_TASK_SUMMARY = {
  total: 0,
  completed: 0,
  blocked: 0,
  overdue: 0,
  assignedToMe: 0,
  byStatus: {},
  byPriority: {},
};

const countBy = (target, key) => {
  const normalizedKey = String(key || 'UNKNOWN');
  target[normalizedKey] = (target[normalizedKey] || 0) + 1;
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'COMPLETED') {
    return false;
  }

  const dueDate = parseDate(task.dueDate);
  if (!dueDate) {
    return false;
  }

  return dueDate < new Date();
};

const buildTaskSummary = (tasks, userId) => tasks.reduce((summary, task) => {
  summary.total += 1;
  countBy(summary.byStatus, task.status);
  countBy(summary.byPriority, task.priority);

  if (task.status === 'COMPLETED') {
    summary.completed += 1;
  }

  if (task.isBlocked) {
    summary.blocked += 1;
  }

  if (isOverdue(task)) {
    summary.overdue += 1;
  }

  if (task.assignedUserIds?.includes(userId)) {
    summary.assignedToMe += 1;
  }

  return summary;
}, {
  ...EMPTY_TASK_SUMMARY,
  byStatus: {},
  byPriority: {},
});

const buildProjectSummary = (projects) => projects.reduce((summary, project) => {
  summary.total += 1;
  countBy(summary.byStatus, project.status);

  return summary;
}, {
  total: 0,
  byStatus: {},
});

export const getSummary = async (userId) => {
  const teams = await teamsService.getTeamsByUser(userId);
  const projectLists = await Promise.all(
    teams.map((team) => projectsRepository.getProjectsByTeamId(team.id))
  );
  const projects = projectLists.flat();
  const taskLists = await Promise.all(
    projects.map((project) => tasksRepository.getTasksByProjectId(project.id))
  );
  const tasks = taskLists.flat();

  const projectSummaries = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);

    return {
      id: project.id,
      name: project.name,
      teamId: project.teamId,
      status: project.status,
      taskSummary: buildTaskSummary(projectTasks, userId),
    };
  });

  return {
    teams: {
      total: teams.length,
    },
    projects: buildProjectSummary(projects),
    tasks: buildTaskSummary(tasks, userId),
    projectSummaries,
  };
};
