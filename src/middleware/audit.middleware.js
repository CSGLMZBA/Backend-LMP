import * as auditController from '../modules/audit/audit.controller'
export const LogFormat = 
{
    userId: '',
    teamId: '',
    chartId: '',
    stageId: '',
    taskId: '',
    details: '',
    performedAt: new Date(),
};

export const LogAction = async (info) =>
{
    auditController.log(info)
};