/*  Errors
*/
const errors = {
    userNotLogged: 'You must be connected.',
    permissionNotGranted: 'Permission not granted.',
    invalidEditRolesArguments: 'Either permissions or channels must be provided.',
    invalidAddFormArguments: 'Form should either correspond to a new resource or existing resource.',
    invalidEditResourceArguments: 'Either fields or permissions must be provided.',
    invalidAddDashboardArguments: 'Dashboard name must be provided.',
    invalidEditDashboardArguments: 'Either name or structure must be provided.',
    invalidAddApplicationArguments: 'Application name must be provided.',
    invalidEditApplicationArguments: 'Either name, status, pages, settings or permissions must be provided.',
    invalidAddPageArguments: 'Page type must be an available type and linked application ID must be provided.',
    invalidEditPageArguments: 'Either name or permissions must be provided.',
    invalidAddWorkflowArguments: 'Page id must be provided.',
    invalidEditWorkflowArguments: 'Either name or steps must be provided.',
    invalidAddStepArguments: 'Step type must be an available type and linked workflow ID must be provided.',
    invalidEditStepArguments: 'Either name, type, content or permissions must be provided.',
    invalidSeeNotificationArguments: 'Notification ID must be provided.',
    invalidPublishNotificationArguments: 'Action, content and channel arguments must all be provided.',
    invalidCORS: 'The CORS policy for this site does not allow access from the specified Origin.',
    dataNotFound: 'Data not found',
    resourceDuplicated: 'An existing resource with that name already exists.',
    roleDuplicated: 'A role with that name already exists.',
    tooManyRoles: 'Only one role per app can be assigned.',
    pageTypeError: 'The page passed in argument is not a workflow type.',
    missingDataField: 'Please add a value name to all questions, inside Data tab.',
    dataFieldDuplicated (name: string) { return `Data name duplicated : ${name}. Please provide different value names for all questions.`; },
    invalidConversion: 'Cannot convert this record to this target form type.'
};

export default errors;
