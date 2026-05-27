import * as auditController from '../modules/audit/audit.controller.js'
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
    const response = await auditController.log(info);
    return response;
};