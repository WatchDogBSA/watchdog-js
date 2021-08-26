import { IssueDetails } from './issue-details';

export interface IssueMessage {
    id?: string,
    issueId?: string,
    occurredOn: Date,
    apiKey: string,
    issueDetails: IssueDetails
}
